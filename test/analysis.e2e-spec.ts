import { HttpStatus } from '@nestjs/common';
import datetimeUtils from '@src/commons/utils/datetime-utils';
import { AnalysisResultDto } from '@src/modules/analysis/dto/analysis-corp-stock.dto';
import { AnalysisItemTypes } from '@src/modules/analysis/types/enums';
import { CorparationService } from '@src/modules/corparation/services/corparation.service';
import UserCreterionDto from '@src/modules/creterions/dto/user-creterion.dto';
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
      const isuSrtCdTarget = 'KOSPI';

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

    const repAR = await userTester.get(`/api/analysis/${isuSrtCdTarget}`);
    repAR.status !== HttpStatus.OK ? console.log('---->', repAR.error) : '';
    expect(repAR.status).toEqual(HttpStatus.OK);
    const aResult = repAR.body as AnalysisResultDto;
    expect(aResult.isuSrtCd).toEqual(isuSrtCdTarget);
    expect(aResult.period.investmentPeriod).toEqual(1);
    expect(aResult.period.timeUint).toEqual('M');
    expect(aResult.period.durationTime < 1).toBeTruthy();
    expect(aResult.period.exceedTime).toEqual(0);
    expect(datetimeUtils.getDayjs(aResult.period.lastTradingAt).get('d')).toEqual(
      datetimeUtils.getNowDayjs().add(-20, 'd').get('d'),
    );
    expect(aResult.period.sentences.length).toEqual(1);

    // 한달 이후
    testingHelper.setNow(datetimeUtils.getNowDayjs().add(20, 'd').format('YYYY-MM-DD HH:mm:ss'));
    const repAROver = await userTester.get(`/api/analysis/${isuSrtCdTarget}`);
    repAROver.status !== HttpStatus.OK ? console.log('---->', repAROver.error) : '';
    expect(repAROver.status).toEqual(HttpStatus.OK);
    const arOver = repAROver.body as AnalysisResultDto;
    expect(arOver.isuSrtCd).toEqual(isuSrtCdTarget);
    expect(arOver.period.investmentPeriod).toEqual(1);
    expect(arOver.period.timeUint).toEqual('M');
    expect(arOver.period.durationTime > 1).toBeTruthy();
    expect(arOver.period.exceedTime > 0).toBeTruthy();
    expect(arOver.period.exceedDate).toEqual(12);
    expect(datetimeUtils.getDayjs(arOver.period.lastTradingAt).get('d')).toEqual(
      datetimeUtils.getNowDayjs().add(-40, 'd').get('d'),
    );
    expect(arOver.period.sentences.length).toEqual(3);
  });
});
