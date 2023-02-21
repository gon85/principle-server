import { HttpStatus } from '@nestjs/common';
import clientAxios from '@src/commons/api-clients/client-axios';
import datetimeUtils from '@src/commons/utils/datetime-utils';
import { CorparationService } from '@src/modules/corparation/services/corparation.service';
import { StockPriceInfoDto } from '@src/modules/stocks/dto/stock-price-info.dto';
import StockDailyPrice from '@src/modules/stocks/entities/stock_daily_price.entity';
import { MoreThanOrEqual } from 'typeorm';
import { getUserTester, testingHelper } from './commons/testing-helper';

describe('Test stock e2e', () => {
  beforeAll(testingHelper.beforeAll);
  afterAll(testingHelper.afterAll);
  beforeEach(async () => {
    await testingHelper.beforeEach();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Test get stock price - 특정기가조회', async () => {
    const prepareTestData = async (emailId: string) => {
      const userTester = await getUserTester(emailId);
      const cService = testingHelper.getService<CorparationService>(CorparationService);
      const sdpRepo = testingHelper.getRepository<StockDailyPrice>(StockDailyPrice);

      // 종목코드 생성
      await cService.initializeCorpCodes(true);
      const isuSrtCdTarget = 'KOSPI';

      // 크롤링후 DB 저장하는지 체크를 위해 삭제처리.
      await sdpRepo.delete({ baseDt: MoreThanOrEqual('20230201'), isuSrtCd: isuSrtCdTarget });

      return {
        userTester,
        isuSrtCdTarget,
        sdpRepo,
      };
    };

    const { userTester, isuSrtCdTarget, sdpRepo } = await prepareTestData('otestStockDaily001');
    // crawingly 목처리 안함.
    const repSDT = await userTester.get('/api/stocks/daily', {
      isuSrtCd: isuSrtCdTarget,
      isuCd: isuSrtCdTarget,
      fromDate: '20230201', // 수요일
      toDate: '20230210', // 금요일
    });
    repSDT.status !== HttpStatus.OK ? console.log('---->', repSDT.error) : '';
    expect(repSDT.status).toEqual(HttpStatus.OK);
    const spiDto = repSDT.body as StockPriceInfoDto;

    expect(spiDto.stockDailyPrices.length).toEqual(10 - 2); // 주말제외
    expect(spiDto.userCorpStats?.hstCount || 0).toEqual(0); // 오늘날짜가 포함되지 않은 조회이므로 로그 생성 안함. 체크
    expect(spiDto.userCorpStats?.hstCountTm || 0).toEqual(0);
    expect(spiDto.stockDailyPrices[0].baseDt > spiDto.stockDailyPrices[1].baseDt).toBeTruthy(); // 역순 확인

    // DB에 추가되었나?
    const cnt = await sdpRepo.count({ where: { baseDt: MoreThanOrEqual('20230201'), isuSrtCd: isuSrtCdTarget } });
    expect(cnt).toEqual(10 - 2);
  });

  it('Test get stock price - 한달 조회(default)', async () => {
    const prepareTestData = async (emailId: string) => {
      const userTester = await getUserTester(emailId);
      const cService = testingHelper.getService<CorparationService>(CorparationService);
      const sdpRepo = testingHelper.getRepository<StockDailyPrice>(StockDailyPrice);

      // 종목코드 생성
      await cService.initializeCorpCodes(true);
      const isuSrtCdTarget = 'KOSPI';

      // 크롤링후 DB 저장하는지 체크를 위해 삭제처리.
      await sdpRepo.delete({ isuSrtCd: isuSrtCdTarget });

      const fromDate = '20230214';
      const toDate = '20230221';
      const qParam = {
        isuSrtCd: isuSrtCdTarget,
        isuCd: isuSrtCdTarget,
        fromDate,
        toDate,
      };
      // DB 데이타 시세 저장 처리.
      const repSDT = await userTester.get('/api/stocks/daily', {
        isuSrtCd: isuSrtCdTarget,
        isuCd: isuSrtCdTarget,
        fromDate,
        toDate: '20230220',
      });
      repSDT.status !== HttpStatus.OK ? console.log('---->', repSDT.error) : '';
      expect(repSDT.status).toEqual(HttpStatus.OK);

      return {
        userTester,
        isuSrtCdTarget,
        sdpRepo,
        qParam,
        today: '2023-02-21',
      };
    };

    const { userTester, qParam, today } = await prepareTestData('otestStockDaily002');

    const jestNaver = jest.spyOn(clientAxios, 'getStockPriceInNaver').mockImplementation(async () => {
      if (datetimeUtils.getNowDayjs().get('hour') >= 17) {
        return [
          ['날짜', '시가', '고가', '저가', '종가', '거래량', '외국인소진율'],
          ['20230221', 2457.51, 2466.07, 2446, 2458.96, 494661, 0],
        ];
      }
      return [['날짜', '시가', '고가', '저가', '종가', '거래량', '외국인소진율']];
    });
    testingHelper.setNow(today + ' 01:01:00');
    await userTester.get('/api/stocks/daily', qParam);
    // 금일 장 시작 전 호출 불필요.
    expect(jestNaver).not.toHaveBeenCalled();

    testingHelper.setNow(today + ' 09:01:00');
    await userTester.get('/api/stocks/daily', qParam);
    expect(jestNaver).toHaveBeenCalled(); // 호출 필요.
    jestNaver.mockClear();

    testingHelper.setNow(today + ' 17:01:00');
    await userTester.get('/api/stocks/daily', qParam);
    // 금일 장 종료 하지만 DB 저장전 이므로 호출
    expect(jestNaver).toHaveBeenCalled();
    jestNaver.mockClear();

    await userTester.get('/api/stocks/daily', qParam);
    // 금일 장 종료 호출 불필요. (DB 저장 후)
    expect(jestNaver).not.toHaveBeenCalled();
  });
});
