import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import clientAxios from '@src/commons/api-clients/client-axios';
import datetimeUtils from '@src/commons/utils/datetime-utils';
import Corparation from '@src/modules/corparation/entities/corparation.entity';
import UserCorpHst from '@src/modules/user/entities/user-corp-hst';
import UserCorpStats from '@src/modules/user/entities/user-corp-stats.entity';
import dayjs, { Dayjs } from 'dayjs';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { StockPriceInfoDto } from '../dto/stock-price-info.dto';
import StockDailyPrice from '../entities/stock_daily_price.entity';
import { CorpsDao } from '@src/dataaccess/corps/corps.dao';
import { isEmpty } from 'lodash';
import reducePromises from '@src/commons/utils/reduce-promise';
import { CrawlingOptions } from '../dto/crawling-options.dto';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockDailyPrice)
    private sdpRepo: Repository<StockDailyPrice>,
    @InjectRepository(Corparation)
    private cRepo: Repository<Corparation>,
    @InjectRepository(UserCorpHst)
    private uchRepo: Repository<UserCorpHst>,
    @InjectRepository(UserCorpStats)
    private ucsRepo: Repository<UserCorpStats>,

    private corpDao: CorpsDao,
  ) {}

  public async getStockDailyPrice(
    isuSrtCd: string,
    isuCd: string,
    fromDate?: string,
    toDate?: string,
    userId?: number,
  ) {
    const sdt = await this.getStockDailyPrices(isuSrtCd, isuCd, fromDate, toDate, userId);

    const company = await this.cRepo.findOne({ where: { isuSrtCd } });
    const ucs = await this.ucsRepo.findOne({ where: { isuSrtCd, userId } });
    return {
      corparation: company,
      userCorpStats: ucs,
      stockDailyPrices: sdt,
    } as StockPriceInfoDto;
  }

  public async getStockDailyPrices(
    isuSrtCd: string,
    isuCd: string,
    fromDate?: string,
    toDate?: string,
    userId?: number,
  ) {
    const fromDayjs = fromDate
      ? datetimeUtils.getDayjs(fromDate, 'YYYYMMDD')
      : datetimeUtils.getTodayDayjs().add(-1, 'months');
    let toDayjs = toDate ? datetimeUtils.getDayjs(toDate, 'YYYYMMDD') : datetimeUtils.getTodayDayjs();
    let withToday = false;

    // ????????? ???????????? ?????????, ????????? ??????
    // ?????? ???????????? ?????? ??? ????????? ?????? ?????? ?????????. ????????? ????????? ??????.
    if (
      toDayjs.format('YYYYMMDD') === datetimeUtils.getNowString('YYYYMMDD') &&
      datetimeUtils.getNowDayjs().get('hour') < 17
    ) {
      toDayjs = datetimeUtils.getTodayDayjs().add(-1, 'day');
      withToday = true;
    }

    const sdt = await this.getStockDailyPriceInDB(isuSrtCd, isuCd, fromDayjs, toDayjs);
    if (sdt.length === 0) {
      await this.appendNSaveSDECrawlingData(sdt, true, isuSrtCd, isuCd, fromDayjs, toDayjs);
    } else {
      const firstDayjs = datetimeUtils.getDayjs(sdt[sdt.length - 1].baseDt, 'YYYYMMDD');
      const endDayjs = datetimeUtils.getDayjs(sdt[0].baseDt, 'YYYYMMDD');

      if (fromDayjs.isBefore(firstDayjs, 'day')) {
        // ??? ?????? ?????? ??????
        // console.log('----> krx call1 (former):', fromdate, firstDayjs.add(-1, 'day').format(Utils.date.YYYYMMDD));
        await this.appendNSaveSDECrawlingData(sdt, false, isuSrtCd, isuCd, fromDayjs, firstDayjs.add(-1, 'day'));
      }
      if (toDayjs.isAfter(endDayjs, 'day')) {
        // ??? ?????? ?????? ??????
        // console.log('----> krx call2 (letter):', endDayjs.add(1, 'day').format(Utils.date.YYYYMMDD), todate);
        await this.appendNSaveSDECrawlingData(sdt, true, isuSrtCd, isuCd, endDayjs.add(1, 'day'), toDayjs);
      }
    }

    // 1. ??????????????? ??????
    // 2. ???????????? (???????????? ????????? ?????? ????????? ?????? ?????? ???.)
    if (withToday && sdt.length > 0) {
      await this.appendTodayNCrawlingData(sdt, isuSrtCd, isuCd, datetimeUtils.getNowDayjs());
      await this.addUserStockLog(isuSrtCd, sdt[sdt.length - 1].clpr, userId);
    }

    return sdt;
  }

  public async crawlingDailyPriceByDate(fromDate: string) {
    // ?????????
    const rep = await clientAxios.getStockPriceInDatagoByDate(fromDate);
    const sdps = rep.response.body.items.item.map((item) => {
      return StockDailyPrice.createBy(item.srtnCd, item);
    });
    await this.sdpRepo.save(sdps);

    const toDate = datetimeUtils.getDayjs(fromDate, 'YYYYMMDD').add(1, 'day').format('YYYYMMDD');
    // ?????? ??????.
    const corpTargets = await this.corpDao.findAllWithoutOrdinary();
    await reducePromises(corpTargets, async (corp) => {
      await this.crawlingDailyPriceBy(corp, { fromDate, toDate, isReset: false });
    });
  }

  public async crawlingDailyPriceByCorp(isuSrtCd: string, crawlingOptions: CrawlingOptions) {
    const {
      fromDate = '20200101',
      toDate = datetimeUtils.getTodayString('YYYYMMDD'),
      isReset = true,
    } = crawlingOptions;

    const corp = await this.corpDao.findCorp(isuSrtCd);
    await this.crawlingDailyPriceBy(corp, { fromDate, toDate, isReset });
  }

  private async crawlingDailyPriceBy(corp: Corparation, crawlingOptions: Required<CrawlingOptions>) {
    const { fromDate, toDate, isReset } = crawlingOptions;
    const { isuSrtCd, kindStkcertTpNm } = corp;

    const spds =
      isEmpty(kindStkcertTpNm) || kindStkcertTpNm === 'INDEX'
        ? await this.crawlingIndexPrice(isuSrtCd, corp.isuAbbrv, fromDate, toDate)
        : kindStkcertTpNm === 'ETF'
        ? await this.crawlingETFPrice(isuSrtCd, fromDate, toDate)
        : await this.crawlingStockPrice(isuSrtCd, fromDate, toDate);

    if (isReset) {
      await this.sdpRepo.delete({ isuSrtCd });
    }
    await this.sdpRepo.save(spds);
  }

  private async crawlingIndexPrice(isuSrtCd: string, idxNm: string, fromDate: string, toDate: string) {
    const rep = await clientAxios.getStockPriceInDatago(idxNm, fromDate, toDate, 'INDEX');
    const sdps = rep.response.body.items.item.map((item) => {
      return StockDailyPrice.createByIndex(isuSrtCd, item);
    });

    return sdps;
  }

  private async crawlingETFPrice(isuSrtCd: string, fromDate: string, toDate: string) {
    const rep = await clientAxios.getStockPriceInDatago(isuSrtCd, fromDate, toDate, 'ETF');
    if (rep.response) {
      const sdps = rep.response.body.items.item.map((item) => {
        return StockDailyPrice.createByEtf(isuSrtCd, item);
      });

      return sdps;
    }
    return [];
  }

  private async crawlingStockPrice(isuSrtCd: string, fromDate: string, toDate: string) {
    const rep = await clientAxios.getStockPriceInDatago(isuSrtCd, fromDate, toDate);
    const sdps = rep.response.body.items.item.map((item) => {
      return StockDailyPrice.createBy(isuSrtCd, item);
    });

    return sdps;
  }

  private async getStockDailyPriceInDB(isuSrtCd: string, isuCd: string, fromDayjs: Dayjs, toDayjs: Dayjs) {
    const sdt = await this.sdpRepo
      .createQueryBuilder()
      .select()
      .where('isu_srt_cd = :isuSrtCd', { isuSrtCd })
      .andWhere('base_dt >= :fromdate', {
        fromdate: fromDayjs.format('YYYYMMDD'),
      })
      .andWhere('base_dt <= :todate', { todate: toDayjs.format('YYYYMMDD') })
      .orderBy('base_dt', 'DESC')
      .getMany();

    return sdt;
  }

  private async appendNSaveSDECrawlingData(
    sdtArray: StockDailyPrice[],
    isPreAppend: boolean,
    isuSrtCd: string,
    isuCd: string,
    fromDayjs: dayjs.Dayjs,
    toDayjs: dayjs.Dayjs,
  ) {
    // naver????????? end date ?????? ??????.
    const repJsonArray = await clientAxios.getStockPriceInNaver(
      isuCd,
      fromDayjs.format('YYYYMMDD'),
      toDayjs.add(1, 'day').format('YYYYMMDD'),
      'day',
    );

    if (repJsonArray.length > 0) {
      const savedSpds = await this.addStockDailyPriceBy(isuSrtCd, repJsonArray);
      if (isPreAppend) {
        sdtArray.unshift(...savedSpds.reverse());
      } else {
        sdtArray.push(...savedSpds.reverse());
      }
    }
  }

  private async addStockDailyPriceBy(isuSrtCd: string, repJsonArray: any) {
    const sdpSaveds = repJsonArray.map((rj) => this.convertJsonToStockPrice(isuSrtCd, rj)) as StockDailyPrice[];
    await this.sdpRepo.save(sdpSaveds);
    return sdpSaveds;

    // // console.log('----> saveSDE count :', repJson.output.length);
    // for (let index = 1; index < repJsonArray.length; index++) {
    //   const rj = repJsonArray[index];
    //   const spd = repoSDT.create(this.convertJsonToStockTrx(isuSrtCd, rj));
    //   await repoSDT.save(spd);
    //   savedSdts.push(spd);
    // }

    // return sdpSaveds;
  }

  private convertJsonToStockPrice(isuSrtCd: string, rj: any) {
    return this.sdpRepo.create({
      isuSrtCd,
      baseDt: rj[0],
      mkp: rj[1],
      hipr: rj[2],
      lopr: rj[3],
      clpr: rj[4],
      trqu: rj[5],
    });
    // return {
    //   isuSrtCd,
    //   trdDd: `${rj[0].substring(0, 4)}/${rj[0].substring(4, 6)}/${rj[0].substring(6, 8)}`,
    //   tddOpnprc: rj[1],
    //   tddHgprc: rj[2],
    //   tddLwprc: rj[3],
    //   tddClsprc: rj[4],
    //   accTrdval: rj[5],
    // };
  }

  private async appendTodayNCrawlingData(sdtArray: StockDailyPrice[], isuSrtCd: string, isuCd: string, todayjs: Dayjs) {
    if (datetimeUtils.isHoliday(todayjs)) return;

    const hour = datetimeUtils.getNowDayjs().get('hour');
    // ??????????????? ?????? ????????? ??????
    if (hour < 9) return;

    if (hour >= 17) {
      const sdt = await this.getStockDailyPriceInDB(isuSrtCd, isuCd, todayjs, todayjs.add(1, 'day'));
      if (sdt.length > 0) {
        sdtArray.unshift(sdt[0]);
        return;
      }
    }
    const repJsonArray = await clientAxios.getStockPriceInNaver(
      isuCd,
      todayjs.format('YYYYMMDD'),
      todayjs.add(1, 'day').format('YYYYMMDD'),
      'day',
    );
    if (!repJsonArray || repJsonArray.length <= 0) return;
    if (hour >= 17) {
      const sdpSaveds = await this.addStockDailyPriceBy(isuSrtCd, repJsonArray);
      sdtArray.push(...sdpSaveds.reverse());
    } else {
      const spd = this.convertJsonToStockPrice(isuSrtCd, repJsonArray[0]);
      sdtArray.unshift(spd);
    }
  }

  private async addUserStockLog(isuSrtCd: string, price: number, userId?: number) {
    if (!userId) return;

    const ush = this.uchRepo.create({
      userId,
      isuSrtCd,
      price,
    });
    await this.uchRepo.save(ush);
    this.uchRepo.find({ where: { userId } });

    const hstCountTm = await this.uchRepo.count({
      where: {
        userId,
        isuSrtCd,
        createdAt: MoreThanOrEqual(datetimeUtils.getTodayDayjs().add(-3, 'month').toDate()),
      },
    });

    const ucs = await this.ucsRepo.findOne({ where: { isuSrtCd, userId } });
    if (ucs) {
      await this.ucsRepo.update(
        { isuSrtCd, userId },
        {
          hstCountTm,
          hstCount: () => `hst_count + ${1}`,
        },
      );
    } else {
      const csm = this.ucsRepo.create({
        isuSrtCd,
        userId,
        hstCount: 1,
        hstCountTm,
        hstLastAt: datetimeUtils.getNowDayjs().toDate(),
      });
      await this.ucsRepo.insert(csm);
    }
  }
}
