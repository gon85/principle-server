import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import PageInfoDto from '@src/commons/dto/page-info.dto';
import { findIndex, flatten, omit, orderBy, pick } from 'lodash';
import { DataSource, EntityManager, IsNull, Not, Repository } from 'typeorm';
import { TradingTrxDto } from '../dto/trading-trx.dto';
import TradingTrx from '../entities/trading-trx.entity';
import TradingMst from '../entities/trading-mst.entity';
import { TradingDao } from '@src/dataaccess/tradings/trading.dao';
import { AnalysisService } from '@src/modules/analysis/services/analysis.service';
import reducePromises from '@src/commons/utils/reduce-promise';
import { CreterionDao } from '@src/dataaccess/creterions/creterion.dao';
import { TradingInfoDto } from '../dto/trading-info.dto';
import { CorpsDao } from '@src/dataaccess/corps/corps.dao';

@Injectable()
export class TradingService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(TradingMst)
    private tmRepo: Repository<TradingMst>,
    @InjectRepository(TradingTrx)
    private ttRepo: Repository<TradingTrx>,

    private corpDao: CorpsDao,
    private creterionDao: CreterionDao,
    private tradingDao: TradingDao,

    private analysisService: AnalysisService,
  ) {}

  public async getTradingInfo(userId: number, pageInfo: PageInfoDto = PageInfoDto.create(1, 10000)) {
    const totalCount = await this.tradingDao.findTotalCount(userId);
    const [holdingList, holdingCount] = await this.tradingDao.findHoldingNCount(userId, pageInfo);

    const needCount = pageInfo.countPerPage - holdingList.length;
    let finishedList: TradingMst[] = [];
    if (needCount <= 0) {
    } else {
      finishedList = await this.tradingDao.findFinishedNCount(
        userId,
        needCount === 0 ? pageInfo.skip - holdingCount : 0,
        needCount === 0 ? pageInfo.countPerPage : needCount,
      );
    }
    pageInfo.totalCount = totalCount;

    const creterion = await this.creterionDao.findByUserId(userId);
    const tidList = await reducePromises(holdingList, async (tmHold) => {
      // const amd = await this.analysisService.forPrice(tmHold, creterion);
      const corp = await this.corpDao.findCorp(tmHold.isuSrtCd);
      const ashd = await this.analysisService.analyseCorpStockBy(corp, tmHold, creterion);
      return TradingInfoDto.createBy(tmHold, ashd);
    });

    return {
      list: [...tidList, ...finishedList],
      pageInfo,
    };
  }

  /**
   * 매매 이력을 등록한다.
   * - 전제 조건 : TradingMst는 기간이 중복될 수 없다.
   * @param user user
   * @param isuSrtCd stock code
   * @param tradingDt trading date ('YYYY/MM/DD')
   * @param price 단가
   * @param cnt 수량
   */
  public async addTradingTrx(
    userId: number,
    ttDto: TradingTrxDto,
    pageInfo: PageInfoDto = PageInfoDto.create(1, 10000),
  ) {
    const { isuSrtCd, tradingAt } = ttDto;
    const ttNew = this.ttRepo.create(ttDto);

    const tmTargets = await this.getTradingMstsAfterDate(userId, isuSrtCd, tradingAt);
    if (!tmTargets || tmTargets.length === 0) {
      // 최초 입력!
      const tmNew = this.tmRepo.create({ userId, isuSrtCd, tradingTrxes: [ttNew] });
      TradingMst.calculate(tmNew);
      await this.addTradingNTrxes(tmNew);
    } else {
      // trading_trx가 시간순으로 정렬 필요. - trading은 매수 -> 매도 완료가 한 묶음(수량이 0이 되는 시점)
      // 기준일 이후의 모든 trading은 재배열해야 함. (trading_trx가 시간순으로 입력된다는 보장이 없음.)
      // 기존것 삭제하고, 새롭게 모두 인서트.
      const ttOrdereds = this.orderingTrxesByTrading(tmTargets, ttNew);
      const ttGrouped = this.groupingTrxesIntoTradings(ttOrdereds);
      if (tmTargets.length === 1 && ttGrouped.length === 1) {
        // 시계열순으로 입력되고 있음.
        const tmTarget = TradingMst.calculate(tmTargets[0], ttGrouped[0]);
        await this.modifyTradingNTrxes(tmTarget, tmTarget.tradingTrxes);
      } else {
        // 시계열순이 아닌 경우 무조건 재정렬
        await this.arrangeTradingMtx(userId, isuSrtCd, tmTargets, ttGrouped);
      }
    }

    return await this.getTradingInfo(userId, pageInfo);
  }

  async removeTradingByTrx(userId: number, isuSrtCd: string, ttId: number) {
    const ttTarget = await this.ttRepo.findOneBy({ id: ttId });
    const tmTargets = await this.getTradingMstsAfterDate(userId, isuSrtCd, ttTarget.tradingAt);
    const txList = this.orderingTrxesByTrading(tmTargets);
    const findedIndex = findIndex(txList, (tx) => {
      return tx.id === ttTarget.id;
    });
    if (findedIndex >= 0) {
      txList.splice(findedIndex, 1);
      const groupingTx = this.groupingTrxesIntoTradings(txList);
      if (tmTargets.length === 1) {
        if (groupingTx.length === 1 && groupingTx[0].length > 0) {
          // 삭제 후 계산만
          await this.removeTradingTrxInMst(ttTarget, tmTargets[0], groupingTx[0]);
        } else {
          // 모두 삭제
          await this.removeTradingMst(tmTargets[0]);
        }
      } else {
        // 삭제 후 재배열
        await this.removeTradingTrxInMstNArrange(ttTarget, userId, isuSrtCd, tmTargets, groupingTx);
      }
    }
    return this.getTradingInfo(userId);
  }

  public async modifyTradingByTrx(userId: number, ttdTarget: TradingTrxDto) {
    const { isuSrtCd, id: ttId } = ttdTarget;
    const ttOrg = await this.ttRepo.findOneBy({ id: ttdTarget.id });
    const ttModifyValue = pick(ttdTarget, ['price', 'tradingAt', 'tradingDate', 'tradingTime', 'cnt']);
    // await this.modifyTradingTrx(tt);
    const targetDt = ttOrg.tradingAt < ttdTarget.tradingAt ? ttOrg.tradingAt : ttdTarget.tradingAt;
    // 변경된 기준으로 대상 tm으로 가져온다.
    const tmTargets = await this.getTradingMstsAfterDate(userId, isuSrtCd, targetDt);
    const tmApplied = this.applyModifyTxInTradings(tmTargets, ttdTarget, ttModifyValue);
    const txList = this.orderingTrxesByTrading(tmApplied);
    const findedIndex = findIndex(txList, (tx) => {
      return tx.id === ttId;
    });
    if (findedIndex < 0) {
      // const tt = pick(ttdTarget, ['price', 'tradingAt', 'tradingDate', 'tradingTime', 'cnt']);
      // await this.ttRepo.update(ttId, tt);
    } else {
      await this.dataSource.transaction(async (trx) => {
        const ttTrxRepo = trx.getRepository(TradingTrx);
        await ttTrxRepo.update(ttId, ttModifyValue);

        const groupingTx = this.groupingTrxesIntoTradings(txList);
        if (tmTargets.length === 1 && groupingTx.length === 1) {
          TradingMst.calculate(tmTargets[0], txList);
          await this.modifyTradingNTrxesInTrx(tmTargets[0], txList)(trx);
        } else {
          await this.arrangeTradingMtxInTrx(userId, isuSrtCd, tmTargets, groupingTx)(trx);
        }
      });
    }

    return this.getTradingInfo(userId);
  }

  /**
   * 기준일 기준 이후(기준일을 포함한 tm)의 모든 tm를 조회한다.
   * @param user user
   * @param isuSrtCd stock code
   * @param tradingDt 기준일
   */
  private async getTradingMstsAfterDate(userId: number, isuSrtCd: string, tradingAt: Date) {
    const qbMain = this.tmRepo
      .createQueryBuilder('t')
      .innerJoinAndSelect('t.tradingTrxes', 'tt')
      .where('t.user_id = :userId', { userId })
      .andWhere('t.isu_srt_cd = :isuSrtCd', { isuSrtCd })
      .andWhere('(t.finished_at is NULL OR t.finished_at >= :tradingAt)', { tradingAt })
      .orderBy('started_at', 'ASC')
      .addOrderBy('finished_at', 'ASC');

    return qbMain.getMany();
    // const ts = await this.tRepo.find({
    //   relations: ['tradingTrxes'],
    //   where: [
    //     {
    //       userId,
    //       isuSrtCd,
    //       finishedAt: IsNull(),
    //     },
    //     {
    //       userId,
    //       isuSrtCd,
    //       finishedAt: MoreThanOrEqual(tradingAt),
    //     },
    //   ],
    //   order: {
    //     startedAt: 'ASC',
    //     finishedAt: 'ASC',
    //   },
    // });
    // return ts;
  }

  private async addTradingNTrxes(tmTarget: TradingMst) {
    await this.dataSource.transaction(async (trx) => {
      await this.addTradingNTrxesInTrx(tmTarget)(trx);
    });
  }

  private addTradingNTrxesInTrx(tmTarget: TradingMst) {
    return async (trx: EntityManager) => {
      const tTrxRepo = trx.getRepository(TradingMst);
      const ttTrxRepo = trx.getRepository(TradingTrx);

      const ir = await tTrxRepo.insert(tmTarget);
      tmTarget.id = ir.generatedMaps[0].id;
      const tradingTrxes = tmTarget.tradingTrxes?.map((tt) => {
        tt.tradingId = tmTarget.id;
        return omit(tt, ['createdAt', 'updatedAt']);
      });
      await ttTrxRepo.upsert(tradingTrxes, ['id']);
    };
  }

  private applyModifyTxInTradings(
    tmTargets: TradingMst[],
    ttdTarget: TradingTrxDto,
    ttModifyValue: Partial<TradingTrx>,
  ) {
    const tmModifies = tmTargets.map((tm) => {
      const tts = tm.tradingTrxes.map((tt) => {
        if (tt.id !== ttdTarget.id) {
          return { ...tt };
        } else {
          return {
            ...tt,
            ...ttModifyValue,
          };
        }
      });
      return {
        ...tm,
        tradingTrxes: tts,
      };
    });

    return tmModifies;
  }

  private async modifyTradingNTrxes(tm: TradingMst, tts: TradingTrx[]) {
    await this.dataSource.transaction(async (trx) => {
      await this.modifyTradingNTrxesInTrx(tm, tts)(trx);
    });
  }

  private modifyTradingNTrxesInTrx(tm: TradingMst, tts: TradingTrx[]) {
    return async (trx: EntityManager) => {
      const tmTrxRepo = trx.getRepository(TradingMst);
      const ttTrxRepo = trx.getRepository(TradingTrx);

      const tModify = omit(tm, ['id', 'createdAt', 'updatedAt', 'tradingTrxes']);
      await tmTrxRepo.update(tm.id, tModify);

      const ttTargets = tts.map((tt) => {
        tt.tradingId = tm.id;
        return omit(tt, ['createdAt']);
      });
      await ttTrxRepo.upsert(ttTargets, ['id']);
    };
  }

  private removeTradingsInTrx(tmTargets: TradingMst[]) {
    return async (trx: EntityManager) => {
      const tTrxRepo = trx.getRepository(TradingMst);

      const ids = tmTargets.map((t) => t.id);
      await tTrxRepo.delete(ids);
    };
  }

  private async arrangeTradingMtx(
    userId: number,
    isuSrtCd: string,
    tmTargets: TradingMst[],
    ttGrouped: TradingTrx[][],
  ) {
    await this.dataSource.transaction(async (trx) => {
      await this.arrangeTradingMtxInTrx(userId, isuSrtCd, tmTargets, ttGrouped)(trx);
    });
  }

  private arrangeTradingMtxInTrx(userId: number, isuSrtCd: string, tmTargets: TradingMst[], ttGrouped: TradingTrx[][]) {
    return async (trx: EntityManager) => {
      for (let index = 0; index < ttGrouped.length; index++) {
        const ttNews = ttGrouped[index];
        const tmNew = this.tmRepo.create({ userId, isuSrtCd, tradingTrxes: ttNews });
        TradingMst.calculate(tmNew);
        await this.addTradingNTrxesInTrx(tmNew)(trx);
      }
      await this.removeTradingsInTrx(tmTargets)(trx);
    };
  }

  private async removeTradingTrxInMst(ttTarget: TradingTrx, tmTarget: TradingMst, ttRemains: TradingTrx[]) {
    await this.dataSource.transaction(async (trx) => {
      const ttTrxRepo = trx.getRepository(TradingTrx);
      await ttTrxRepo.delete({ id: ttTarget.id });
      TradingMst.calculate(tmTarget, ttRemains);
      await this.modifyTradingNTrxesInTrx(tmTarget, tmTarget.tradingTrxes)(trx);
    });
  }

  private async removeTradingTrxInMstNArrange(
    ttTarget: TradingTrx,
    userId: number,
    isuSrtCd: string,
    tmTargets: TradingMst[],
    ttGrouped: TradingTrx[][],
  ) {
    await this.dataSource.transaction(async (trx) => {
      const ttTrxRepo = trx.getRepository(TradingTrx);
      await ttTrxRepo.delete({ id: ttTarget.id });
      await this.arrangeTradingMtxInTrx(userId, isuSrtCd, tmTargets, ttGrouped)(trx);
    });
  }

  private async removeTradingMst(tmTarget: TradingMst) {
    await this.dataSource.transaction(async (trx) => {
      const tmTrxRepo = trx.getRepository(TradingMst);
      const ttTrxRepo = trx.getRepository(TradingTrx);

      await ttTrxRepo.delete({ tradingId: tmTarget.id });
      await tmTrxRepo.delete({ id: tmTarget.id });
    });
  }

  private orderingTrxesByTrading(tms: TradingMst[], ttNew?: TradingTrx) {
    const tts = tms.map((t) => t.tradingTrxes);
    const ttTargets = flatten(tts);
    if (ttNew) ttTargets.push(ttNew);

    const ttOrdered = orderBy(ttTargets, ['tradingAt'], ['asc']);
    return ttOrdered;
  }

  private groupingTrxesIntoTradings(ttOrdereds: TradingTrx[]) {
    let remain = 0;
    const grouping: TradingTrx[][] = [];
    let arrTt: TradingTrx[] = [];
    for (let index = 0; index < ttOrdereds.length; index++) {
      const tt = ttOrdereds[index];
      remain += tt.tradingTypeCd === 'B' ? tt.cnt : -tt.cnt;
      arrTt.push(tt);
      if (remain <= 0) {
        grouping.push(arrTt);
        arrTt = [];
        remain = 0;
      }
    }
    if (arrTt.length > 0) {
      grouping.push(arrTt);
    }
    return grouping;
  }
}
