import { HttpStatus } from '@nestjs/common';
import clientAxios from '@src/commons/api-clients/client-axios';
import datetimeUtils from '@src/commons/utils/datetime-utils';
import reducePromises from '@src/commons/utils/reduce-promise';
import UserAlarmDto from '@src/modules/creterions/dto/user-alarm.dto';
import UserCreterionDto from '@src/modules/creterions/dto/user-creterion.dto';
import { StockPriceInfoDto } from '@src/modules/stocks/dto/stock-price-info.dto';
import { TradingTrxDto } from '@src/modules/tradings/dto/trading-trx.dto';
import { fakeDataHelper } from './commons/fake-data-helper';
import { StockSenario } from './commons/senarios/stock-senarios';
import { getUserTester, testingHelper } from './commons/testing-helper';

describe('NOT Test user e2e ', () => {
  beforeAll(testingHelper.beforeAll);
  afterAll(testingHelper.afterAll);
  beforeEach(async () => {
    await testingHelper.beforeEach();
  });

  it('NOT Test 개발을 위한 정상적인 이용자 생성', async () => {
    const ucdTarget: UserCreterionDto = {
      targetProfitRatio: 10,
      maxLossRatio: -5,
      investmentPeriod: 1,
      investmentPeriodUnit: 'M',
      maxHoldCorpCnt: 3,
      maxBuyingAmount: 2000000,
      maxFocusInterestCnt: 5,
    };
    const userTester = await getUserTester('otest001', { ucd: ucdTarget });

    // 알림 설정
    const uadTarget = {
      alarmCategoryCd: 'AT',
      time: '22:00',
      isUse: true,
    } as UserAlarmDto;
    const repUAaved = await userTester.post('/api/creterions/alarm', uadTarget);
    repUAaved.status !== HttpStatus.CREATED ? console.log('---->', repUAaved.error) : '';
    expect(repUAaved.status).toEqual(HttpStatus.CREATED);

    const isuSrtCdTarget = 'KOSPI';
    const fromDate = datetimeUtils.getNowDayjs().add(-1, 'month').format('YYYYMMDD');
    const toDate = datetimeUtils.getNowDayjs().format('YYYYMMDD');

    // 세세조회 - 데이터 클리어 후
    const stockSenario = new StockSenario();
    await stockSenario.resetStocks(isuSrtCdTarget);

    const repSDT = await userTester.get('/api/stocks/daily', {
      isuSrtCd: isuSrtCdTarget,
      isuCd: isuSrtCdTarget,
      fromDate,
      toDate,
    });
    repSDT.status !== HttpStatus.OK ? console.log('---->', repSDT.error) : '';
    expect(repSDT.status).toEqual(HttpStatus.OK);
    const spiDto = repSDT.body as StockPriceInfoDto;

    // 매매등록
    const sdp = spiDto.stockDailyPrices[5];
    const buyPrice = sdp.lopr + (sdp.hipr - sdp.lopr / 2);

    const ttd: TradingTrxDto = {
      isuSrtCd: sdp.isuSrtCd,
      tradingDate: sdp.baseDt,
      tradingTime: '13:01:01',
      tradingAt: datetimeUtils.toUtcDate(sdp.baseDt + ' 13:01:01', 'YYYYMMDD HH:mm:ss'),
      tradingTypeCd: 'B',
      price: buyPrice,
      cnt: 10,
    };
    const rep = await userTester.post('/api/tradings', ttd);
    rep.status !== HttpStatus.CREATED ? console.log('---->', rep.error) : '';
    expect(rep.status).toEqual(HttpStatus.CREATED);
  });
});
