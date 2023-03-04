import { HttpStatus } from '@nestjs/common';
import datetimeUtils from '@src/commons/utils/datetime-utils';
import { AnalysisPeriodDto } from '@src/modules/analysis/dto/analysis-period.dto';
import { AnalysisProfitDto } from '@src/modules/analysis/dto/analysis-profit.dto';
import { CorparationService } from '@src/modules/corparation/services/corparation.service';
import UserCreterionDto from '@src/modules/creterions/dto/user-creterion.dto';
import StockDailyPrice from '@src/modules/stocks/entities/stock_daily_price.entity';
import { StockService } from '@src/modules/stocks/services/stock.service';
import { getUserTester, testingHelper } from './commons/testing-helper';

describe('Test aynalysis e2e', () => {
  beforeAll(testingHelper.beforeAll);
  afterAll(testingHelper.afterAll);
  beforeEach(async () => {
    testingHelper.resetNow();
    await testingHelper.beforeEach();
  });

  it('Test analyse period', async () => {
    const prepareTestData = async (emailId: string, ucdTarget: UserCreterionDto) => {
      const userTester = await getUserTester(emailId, { ucd: ucdTarget });
      const cService = testingHelper.getService<CorparationService>(CorparationService);

      // 종목코드 생성
      await cService.initializeCorpCodes(true);
      const isuSrtCdTarget = 'KOSPIT';

      // 최초 투자 (1개월 전)
      const rep = await userTester.post('/api/tradings', {
        isuSrtCd: isuSrtCdTarget,
        tradingDate: datetimeUtils.getNowDayjs().add(-20, 'd').format('YYYY-MM-DD'),
        tradingTime: '13:01:01',
        tradingAt: datetimeUtils.getNowDayjs().add(-20, 'd').toDate(),
        tradingTypeCd: 'B',
        price: 1000,
        cnt: 10,
      });
      rep.status !== HttpStatus.CREATED ? console.log('---->', rep.error) : '';
      expect(rep.status).toEqual(HttpStatus.CREATED);

      return {
        userTester,
        isuSrtCdTarget,
      };
    };

    const ucdTarget: UserCreterionDto = {
      targetProfitRatio: 10,
      maxLossRatio: 5,
      investmentPeriod: 1,
      investmentPeriodUnit: 'M',
      maxHoldCorpCnt: 3,
      maxBuyingAmount: 2000000,
      maxFocusInterestCnt: 5,
    };
    const { userTester, isuSrtCdTarget } = await prepareTestData('otestAnalysis001', ucdTarget);

    const repAR = await userTester.get(`/api/analysis/${isuSrtCdTarget}/period`);
    repAR.status !== HttpStatus.OK ? console.log('---->', repAR.error) : '';
    expect(repAR.status).toEqual(HttpStatus.OK);
    const apd = repAR.body as AnalysisPeriodDto;
    expect(apd.investmentPeriod).toEqual(1);
    expect(apd.timeUint).toEqual('M');
    expect(apd.durationTime < 1).toBeTruthy();
    expect(apd.exceedTime).toEqual(0);
    expect(datetimeUtils.getDayjs(apd.lastTradingAt).get('d')).toEqual(
      datetimeUtils.getNowDayjs().add(-20, 'd').get('d'),
    );
    expect(apd.sentences.length).toEqual(1);

    // 한달 이후
    testingHelper.setNow(datetimeUtils.getNowDayjs().add(20, 'd').format('YYYY-MM-DD HH:mm:ss'));
    const repAROver = await userTester.get(`/api/analysis/${isuSrtCdTarget}/period`);
    repAROver.status !== HttpStatus.OK ? console.log('---->', repAROver.error) : '';
    expect(repAROver.status).toEqual(HttpStatus.OK);
    const apdOver = repAROver.body as AnalysisPeriodDto;
    expect(apdOver.investmentPeriod).toEqual(1);
    expect(apdOver.timeUint).toEqual('M');
    expect(apdOver.durationTime > 1).toBeTruthy();
    expect(apdOver.exceedTime > 0).toBeTruthy();
    expect(apdOver.exceedDate).toEqual(12);
    expect(datetimeUtils.getDayjs(apdOver.lastTradingAt).get('d')).toEqual(
      datetimeUtils.getNowDayjs().add(-40, 'd').get('d'),
    );
    expect(apdOver.sentences.length).toEqual(3);
  });

  it('Test analyse profit', async () => {
    const prepareTestData = async (emailId: string, ucdTarget: UserCreterionDto) => {
      const userTester = await getUserTester(emailId, { ucd: ucdTarget });
      const cService = testingHelper.getService<CorparationService>(CorparationService);

      // 종목코드 생성
      await cService.initializeCorpCodes(true);
      const isuSrtCdTarget = 'KOSPIT';

      // 최초 투자 (1개월 전)
      const rep = await userTester.post('/api/tradings', {
        isuSrtCd: isuSrtCdTarget,
        tradingDate: datetimeUtils.getNowDayjs().add(-20, 'd').format('YYYY-MM-DD'),
        tradingTime: '13:01:01',
        tradingAt: datetimeUtils.getNowDayjs().add(-20, 'd').toDate(),
        tradingTypeCd: 'B',
        price: 2600,
        cnt: 10,
      });
      rep.status !== HttpStatus.CREATED ? console.log('---->', rep.error) : '';
      expect(rep.status).toEqual(HttpStatus.CREATED);

      return {
        userTester,
        isuSrtCdTarget,
      };
    };

    const ucdTarget: UserCreterionDto = {
      targetProfitRatio: 10,
      maxLossRatio: 5,
      investmentPeriod: 1,
      investmentPeriodUnit: 'M',
      maxHoldCorpCnt: 3,
      maxBuyingAmount: 2000000,
      maxFocusInterestCnt: 5,
    };
    const { userTester, isuSrtCdTarget } = await prepareTestData('otestAnalysis002', ucdTarget);

    const fakeSDP = {
      isuSrtCd: isuSrtCdTarget,
      baseDt: datetimeUtils.getNowDayjs().format('YYYYMMDD'),
      mrktCtg: 'KOSPI',
      clpr: 2600 + 260,
      vs: 0,
      fltRt: 0.0,
      mkp: 2600,
      hipr: 2600 + 260,
      lopr: 2600,
      trqu: 10000,
      trPrc: 10000,
      lstgStCnt: 100,
      mrktTotAmt: 100000,
      createdAt: datetimeUtils.getDayjs().toDate(),
      updatedAt: datetimeUtils.getDayjs().toDate(),
    } as StockDailyPrice;

    const stockService = testingHelper.getService<StockService>(StockService);
    jest
      .spyOn(stockService, 'getStockDailyPrices')
      .mockImplementation(
        async (
          isuSrtCd: string,
          isuCd: string,
          fromDate?: string,
          toDate?: string,
          userId?: number,
        ): Promise<StockDailyPrice[]> => [fakeSDP],
      );

    const repAR = await userTester.get(`/api/analysis/${isuSrtCdTarget}/profit`);
    repAR.status !== HttpStatus.OK ? console.log('---->', repAR.error) : '';
    expect(repAR.status).toEqual(HttpStatus.OK);
    const apdProfit = repAR.body as AnalysisProfitDto;
    expect(apdProfit.targetProfitRatio).toEqual(ucdTarget.targetProfitRatio);
    expect(apdProfit.maxLossRatio).toEqual(ucdTarget.maxLossRatio);
    expect(apdProfit.currentPrice).toEqual(2600 + 260);
    expect(apdProfit.avgBuyPrice).toEqual(2600);
    expect(apdProfit.sumBuyPrice).toEqual(0);
    expect(apdProfit.avgSellPrice).toEqual(0);
    expect(apdProfit.sumSellPrice).toEqual(0);
    expect(apdProfit.remainCount).toEqual(10);
    expect(apdProfit.profit).toEqual(10.0);
    expect(apdProfit.sentences.length > 0).toBeTruthy();

    // 손실 처리.
    fakeSDP.clpr = 2600 - 260;
    const repARLoss = await userTester.get(`/api/analysis/${isuSrtCdTarget}/profit`);
    repARLoss.status !== HttpStatus.OK ? console.log('---->', repARLoss.error) : '';
    expect(repARLoss.status).toEqual(HttpStatus.OK);
    const apdLoss = repARLoss.body as AnalysisProfitDto;
    expect(apdLoss.targetProfitRatio).toEqual(ucdTarget.targetProfitRatio);
    expect(apdLoss.maxLossRatio).toEqual(ucdTarget.maxLossRatio);
    expect(apdLoss.currentPrice).toEqual(2600 - 260);
    expect(apdLoss.avgBuyPrice).toEqual(2600);
    expect(apdLoss.sumBuyPrice).toEqual(0);
    expect(apdLoss.avgSellPrice).toEqual(0);
    expect(apdLoss.sumSellPrice).toEqual(0);
    expect(apdLoss.remainCount).toEqual(10);
    expect(apdLoss.profit).toEqual(-10.0);
    expect(apdLoss.sentences.length > 0).toBeTruthy();
    const find = apdLoss.sentences.find((s) => s.includes('정리'));
    expect(find).not.toBeUndefined();
  });
});
