import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import PageInfoDto from '@src/commons/dto/page-info.dto';
import { flatten, omit, orderBy } from 'lodash';
import { DataSource, EntityManager, IsNull, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { TradingTrxDto } from '../dto/trading-trx.dto';
import TradingTrx from '../entities/trading-trx.entity';
import Trading from '../entities/trading.entity';

@Injectable()
export class TradingService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Trading)
    private tRepo: Repository<Trading>,
    @InjectRepository(TradingTrx)
    private ttRepo: Repository<TradingTrx>,
  ) {}

  public async getTradingInfo(userId: number, pageInfo: PageInfoDto) {
    const totalCount = await this.tRepo.count({
      where: {
        userId,
      },
    });
    const [noFinishList, noFinishCount] = await this.tRepo.findAndCount({
      where: {
        userId,
        finishedAt: IsNull(),
      },
      order: {
        startedAt: 'DESC',
      },
      skip: pageInfo.skip,
      take: pageInfo.countPerPage,
    });

    const needCount = pageInfo.countPerPage - noFinishList.length;
    let finishList: Trading[] = [];
    if (needCount <= 0) {
    } else {
      finishList = await this.tRepo.find({
        where: {
          userId,
          finishedAt: Not(IsNull()), // LessThan(Utils.date.getNowDayjs().add(1, 'day').format(Utils.date.YYYYsMMsDD)),
        },
        order: {
          finishedAt: 'DESC',
          startedAt: 'DESC',
        },
        skip: needCount === 0 ? pageInfo.skip - noFinishCount : 0,
        take: needCount === 0 ? pageInfo.countPerPage : needCount,
      });
    }
    pageInfo.totalCount = totalCount;

    return {
      list: [...noFinishList, ...finishList],
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

    const tTargets = await this.getTradingMstsAfterDate(userId, isuSrtCd, tradingAt);
    if (!tTargets || tTargets.length === 0) {
      // 최초 입력!
      const tNew = this.tRepo.create({ userId, isuSrtCd, tradingTrxes: [ttNew] });
      Trading.calculate(tNew);
      await this.addTradingNTrxes(tNew);
    } else {
      // trading_trx가 시간순으로 정렬 필요. - trading은 매수 -> 매도 완료가 한 묶음(수량이 0이 되는 시점)
      // 기준일 이후의 모든 trading은 재배열해야 함. (trading_trx가 시간순으로 입력된다는 보장이 없음.)
      // 기존것 삭제하고, 새롭게 모두 인서트.
      const ttOrdereds = this.orderingTrxesByTrading(tTargets, ttNew);
      const ttGrouped = this.groupingTrxesIntoTradings(ttOrdereds);
      if (tTargets.length === 1 && ttGrouped.length === 1) {
        // 시계열순으로 입력되고 있음.
        const tTarget = Trading.calculate(tTargets[0]);
        await this.modifyTradingNTrxesInTrx(tTarget, ttGrouped[0]);
      } else {
        // 시계열순이 아닌 경우 무조건 재정렬
        await this.arrangeTradingMtx(userId, isuSrtCd, tTargets, ttGrouped);
      }
    }

    return await this.getTradingInfo(userId, pageInfo);
  }

  /**
   * 기준일 기준 이후(기준일을 포함한 tm)의 모든 tm를 조회한다.
   * @param user user
   * @param isuSrtCd stock code
   * @param tradingDt 기준일
   */
  private async getTradingMstsAfterDate(userId: number, isuSrtCd: string, tradingAt: Date) {
    const ts = await this.tRepo.find({
      where: [
        {
          userId,
          isuSrtCd,
          finishedAt: IsNull(),
        },
        {
          userId,
          isuSrtCd,
          finishedAt: MoreThanOrEqual(tradingAt),
        },
      ],
      order: {
        startedAt: 'ASC',
        finishedAt: 'ASC',
      },
    });
    return ts;
  }

  private async addTradingNTrxes(tTarget: Trading) {
    await this.dataSource.transaction(async (trx) => {
      await this.addTradingNTrxesInTrx(tTarget)(trx);
    });
  }

  private addTradingNTrxesInTrx(tTarget: Trading) {
    return async (trx: EntityManager) => {
      const tTrxRepo = trx.getRepository(Trading);
      const ttTrxRepo = trx.getRepository(TradingTrx);

      const ir = await tTrxRepo.insert(tTarget);
      tTarget.id = ir.generatedMaps[0].id;
      tTarget.tradingTrxes?.map((tt) => {
        tt.tradingId = tTarget.id;
      });
      await ttTrxRepo.upsert(tTarget.tradingTrxes, ['id']);
    };
  }

  private async modifyTradingNTrxesInTrx(t: Trading, tts: TradingTrx[]) {
    await this.dataSource.transaction(async (trx) => {
      const tTrxRepo = trx.getRepository(Trading);
      const ttTrxRepo = trx.getRepository(TradingTrx);

      const tModify = omit(t, ['id', 'createdAt', 'updatedAt', 'tradingTrxes']);
      await tTrxRepo.update(t.id, tModify);

      tts.map((tt) => {
        tt.tradingId = t.id;
      });
      await ttTrxRepo.upsert(tts, ['id']);
    });
  }

  private removeTradingsInTrx(tTargets: Trading[]) {
    return async (trx: EntityManager) => {
      const tTrxRepo = trx.getRepository(Trading);

      const ids = tTargets.map((t) => t.id);
      await tTrxRepo.delete(ids);
    };
  }

  private async arrangeTradingMtx(userId: number, isuSrtCd: string, tTargets: Trading[], ttGrouped: TradingTrx[][]) {
    await this.dataSource.transaction(async (trx) => {
      for (let index = 0; index < ttGrouped.length; index++) {
        const ttNews = ttGrouped[index];
        const tNew = this.tRepo.create({ userId, isuSrtCd, tradingTrxes: ttNews });
        Trading.calculate(tNew);
        await this.addTradingNTrxesInTrx(tNew)(trx);
      }
      await this.removeTradingsInTrx(tTargets)(trx);
    });
  }

  private orderingTrxesByTrading(tradings: Trading[], ttNew?: TradingTrx) {
    const tts = tradings.map((t) => t.tradingTrxes);
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
      remain += tt.cnt;
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
