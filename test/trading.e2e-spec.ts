import { HttpStatus } from '@nestjs/common';
import datetimeUtils, { DATETIME_FORMAT } from '@src/commons/utils/datetime-utils';
import reducePromises from '@src/commons/utils/reduce-promise';
import { CorparationService } from '@src/modules/corparation/services/corparation.service';
import { TradingInfoDto } from '@src/modules/tradings/dto/trading-info.dto';
import { TradingTrxDto } from '@src/modules/tradings/dto/trading-trx.dto';
import TradingMst from '@src/modules/tradings/entities/trading-mst.entity';
import { getUserTester, testingHelper } from './commons/testing-helper';

describe('Test trading e2e ', () => {
  beforeAll(testingHelper.beforeAll);
  afterAll(testingHelper.afterAll);
  beforeEach(async () => {
    await testingHelper.beforeEach();
  });

  const testDataHelper = {
    fakeTradingInputData(isuSrtCd: string): TradingTrxDto[] {
      const ts = [
        { isuSrtCd, tradingDate: '2020-11-02', tradingTime: '13:01:01', tradingTypeCd: 'B', price: 1000, cnt: 10 }, // 0
        { isuSrtCd, tradingDate: '2020-11-03', tradingTime: '13:01:01', tradingTypeCd: 'S', price: 1000, cnt: 10 }, // 1 거래완료
        { isuSrtCd, tradingDate: '2020-11-04', tradingTime: '13:01:01', tradingTypeCd: 'B', price: 1000, cnt: 10 }, // 2
        { isuSrtCd, tradingDate: '2020-11-05', tradingTime: '13:01:01', tradingTypeCd: 'B', price: 1000, cnt: 10 }, // 3
        { isuSrtCd, tradingDate: '2020-11-06', tradingTime: '13:01:01', tradingTypeCd: 'S', price: 1000, cnt: 20 }, // 4 거래완료
        { isuSrtCd, tradingDate: '2020-11-09', tradingTime: '13:01:01', tradingTypeCd: 'B', price: 1000, cnt: 10 }, // 5
        { isuSrtCd, tradingDate: '2020-11-11', tradingTime: '13:01:01', tradingTypeCd: 'B', price: 2000, cnt: 10 }, // 6
        { isuSrtCd, tradingDate: '2020-11-16', tradingTime: '13:01:01', tradingTypeCd: 'S', price: 2000, cnt: 20 }, // 7 거래완료
        { isuSrtCd, tradingDate: '2020-11-23', tradingTime: '13:01:01', tradingTypeCd: 'B', price: 1000, cnt: 10 }, // 8
        { isuSrtCd, tradingDate: '2020-11-25', tradingTime: '13:01:01', tradingTypeCd: 'S', price: 1000, cnt: 10 }, // 9 거래완료
      ];

      return ts.map(
        (t) =>
          ({
            ...t,
            tradingAt: datetimeUtils.toUtcDate(t.tradingDate + ' ' + t.tradingTime, 'YYYY-MM-DD HH:mm:ss'),
          } as TradingTrxDto),
      );
    },
    /**
     * expect!!
     * @param tm {TradingMst}
     * @param sDt 거래시작일
     * @param fDt 거래완료일
     * @param abp 매수평균가
     * @param asp 매도평균가
     * @param rc 남은 수량
     * @param ttLength 거래trx 갯수
     */
    expectTrading(tm: TradingMst, sDt: Date, fDt: Date | null, abp: number, asp: number, rc: number, ttLength: number) {
      expect(datetimeUtils.getDayjs(tm.startedAt).format(DATETIME_FORMAT)).toEqual(
        datetimeUtils.getDayjs(sDt).format(DATETIME_FORMAT),
      );
      expect(datetimeUtils.getDayjs(tm.finishedAt).format(DATETIME_FORMAT)).toEqual(
        datetimeUtils.getDayjs(fDt).format(DATETIME_FORMAT),
      );
      expect(tm.avgBuyPrice).toEqual(abp);
      expect(tm.avgSellPrice).toEqual(asp);
      expect(tm.remainCount).toEqual(rc);
      expect(tm.tradingTrxes.length).toEqual(ttLength);
    },

    expectLast(tiResult: TradingInfoDto, isuSrtCdTarget: string) {
      const fakeTradingData = testDataHelper.fakeTradingInputData(isuSrtCdTarget);
      // 시간 순으로 정렬되고, 매수-매도 묶음 단위로 처리되었나?
      expect(4).toEqual(tiResult.list.length);
      /* eslint-disable */
      testDataHelper.expectTrading(tiResult.list[0], fakeTradingData[8].tradingAt, fakeTradingData[9].tradingAt, 1000, 1000, 0, 2);
      testDataHelper.expectTrading(tiResult.list[1], fakeTradingData[5].tradingAt, fakeTradingData[7].tradingAt, 1500, 2000, 0, 3);
      testDataHelper.expectTrading(tiResult.list[2], fakeTradingData[2].tradingAt, fakeTradingData[4].tradingAt, 1000, 1000, 0, 3);
      testDataHelper.expectTrading(tiResult.list[3], fakeTradingData[0].tradingAt, fakeTradingData[1].tradingAt, 1000, 1000, 0, 2);
      /* eslint-enable */
    },
  };

  it.skip('Test timezoen 처리', async () => {
    const prepareTestData = async (emailId: string) => {
      const userTester = await getUserTester(emailId);
      const cService = testingHelper.getService<CorparationService>(CorparationService);

      // 종목코드 생성
      await cService.initializeCorpCodes(true);
      const isuSrtCdTarget = 'KOSPI';

      return {
        userTester,
        isuSrtCdTarget,
      };
    };
    const { userTester, isuSrtCdTarget } = await prepareTestData('otestTrading002');
    const fakeTradingData = testDataHelper.fakeTradingInputData(isuSrtCdTarget);
    const ttd = fakeTradingData[0];

    const rep = await userTester.post('/api/tradings', ttd);
    rep.status !== HttpStatus.CREATED ? console.log('---->', rep.error) : '';
    expect(rep.status).toEqual(HttpStatus.CREATED);

    const tiResult = rep.body as TradingInfoDto;
    const t = tiResult.list[0];
    const djs = datetimeUtils.getDayjs(t.tradingTrxes[0].createdAt);
    console.log(t.tradingTrxes[0].createdAt);
    console.log(djs.format(DATETIME_FORMAT));
    console.log(djs.format());
    console.log(djs.isUTC());
    console.log(djs.utc().format(DATETIME_FORMAT));
    console.log(djs.utc().format());
    console.log(djs.utc().isUTC());
  });

  describe('Test add trading', () => {
    it('Test add trading - 거래내역 시간순으로 입력', async () => {
      const prepareTestData = async (emailId: string) => {
        const userTester = await getUserTester(emailId);
        const cService = testingHelper.getService<CorparationService>(CorparationService);
        // const cRepo = testingHelper.getRepository<Corparation>(Corparation);

        // 종목코드 생성
        await cService.initializeCorpCodes(true);
        const isuSrtCdTarget = 'KOSPI';

        return {
          userTester,
          isuSrtCdTarget,
        };
      };
      const { userTester, isuSrtCdTarget } = await prepareTestData('otestTrading001');
      const fakeTradingData = testDataHelper.fakeTradingInputData(isuSrtCdTarget);
      await reducePromises(fakeTradingData, async (ttd) => {
        const rep = await userTester.post('/api/tradings', ttd);
        rep.status !== HttpStatus.CREATED ? console.log('---->', rep.error) : '';
        expect(rep.status).toEqual(HttpStatus.CREATED);
      });
      const repTrading = await userTester.get('/api/tradings');
      expect(repTrading.status).toEqual(HttpStatus.OK);
      const tiResult = repTrading.body as TradingInfoDto;

      // 시간 순으로 정렬되고, 매수-매도 묶음 단위로 처리되었나?
      expect(4).toEqual(tiResult.list.length);
      /* eslint-disable */
      testDataHelper.expectTrading(tiResult.list[0], fakeTradingData[8].tradingAt, fakeTradingData[9].tradingAt, 1000, 1000, 0, 2);
      testDataHelper.expectTrading(tiResult.list[1], fakeTradingData[5].tradingAt, fakeTradingData[7].tradingAt, 1500, 2000, 0, 3);
      testDataHelper.expectTrading(tiResult.list[2], fakeTradingData[2].tradingAt, fakeTradingData[4].tradingAt, 1000, 1000, 0, 3);
      testDataHelper.expectTrading(tiResult.list[3], fakeTradingData[0].tradingAt, fakeTradingData[1].tradingAt, 1000, 1000, 0, 2);
      /* eslint-enable */
    });

    it('Test add trading - 거래내역 시간순 아니게 추가 체크', async () => {
      const prepareTestData = async (emailId: string) => {
        const userTester = await getUserTester(emailId);
        const cService = testingHelper.getService<CorparationService>(CorparationService);
        // const cRepo = testingHelper.getRepository<Corparation>(Corparation);

        // 종목코드 생성
        await cService.initializeCorpCodes(true);
        const isuSrtCdTarget = 'KOSPI';

        return {
          userTester,
          isuSrtCdTarget,
        };
      };
      const { userTester, isuSrtCdTarget } = await prepareTestData('otestTrading003');
      const fakeTradingData = testDataHelper.fakeTradingInputData(isuSrtCdTarget);

      // 0, 2, 4, 5, 8, 9 => [0,2,4][5,8,9]
      // 10 10 -20 / 10 10 -10
      const results = await reducePromises([0, 2, 4, 5, 8, 9], async (index) => {
        const ttd = fakeTradingData[index];
        const rep = await userTester.post('/api/tradings', ttd);
        rep.status !== HttpStatus.CREATED ? console.log('---->', rep.error) : '';
        expect(rep.status).toEqual(HttpStatus.CREATED);
        return rep.body as TradingInfoDto;
      });
      const tiResult = results[results.length - 1];
      expect(tiResult.list.length).toEqual(2);
      /* eslint-disable */
      testDataHelper.expectTrading(tiResult.list[1], fakeTradingData[0].tradingAt, fakeTradingData[4].tradingAt, 1000, 1000, 0, 3);
      testDataHelper.expectTrading(tiResult.list[0], fakeTradingData[5].tradingAt, null, 1000, 1000, 10, 3);
      /* eslint-enable */

      // 0, 2, 4, 5, 8, 9, 1 => [0, 1][2, 4][5, 8, 9] => 즉 index 1 추가할 경우
      // 10 -10 / 10 -20 / 10 10 -10
      const ttd1 = fakeTradingData[1];
      const rep1 = await userTester.post('/api/tradings', ttd1);
      rep1.status !== HttpStatus.CREATED ? console.log('---->', rep1.error) : '';
      expect(rep1.status).toEqual(HttpStatus.CREATED);
      const tiResultAdd1 = rep1.body as TradingInfoDto;
      expect(tiResultAdd1.list.length).toEqual(3);
      /* eslint-disable */
      testDataHelper.expectTrading(tiResultAdd1.list[2], fakeTradingData[0].tradingAt, fakeTradingData[1].tradingAt, 1000, 1000, 0, 2);
      testDataHelper.expectTrading(tiResultAdd1.list[1], fakeTradingData[2].tradingAt, null, 1000, 1000, -10, 2); // 음수가 되는 경우
      testDataHelper.expectTrading(tiResultAdd1.list[0], fakeTradingData[5].tradingAt, null, 1000, 1000, 10, 3);
      /* eslint-enable */

      // 0, 2, 4, 5, 8, 9, 1, 7 => [0, 1][2, 4][5, 7][8, 9]
      // 10 -10 / 10 -20 / 10 -20 / 10 -10
      const ttd7 = fakeTradingData[7];
      const rep7 = await userTester.post('/api/tradings', ttd7);
      rep7.status !== HttpStatus.CREATED ? console.log('---->', rep7.error) : '';
      expect(rep7.status).toEqual(HttpStatus.CREATED);
      const tiResultAdd7 = rep7.body as TradingInfoDto;
      expect(tiResultAdd7.list.length).toEqual(4);
      /* eslint-disable */
      testDataHelper.expectTrading(tiResultAdd7.list[3], fakeTradingData[0].tradingAt, fakeTradingData[1].tradingAt, 1000, 1000, 0, 2);
      testDataHelper.expectTrading(tiResultAdd7.list[2], fakeTradingData[8].tradingAt, fakeTradingData[9].tradingAt, 1000, 1000, 0, 2);
      testDataHelper.expectTrading(tiResultAdd7.list[1], fakeTradingData[2].tradingAt, null, 1000, 1000, -10, 2);
      testDataHelper.expectTrading(tiResultAdd7.list[0], fakeTradingData[5].tradingAt, null, 1000, 2000, -10, 2);
      /* eslint-enable */

      await userTester.post('/api/tradings', fakeTradingData[3]);
      const repFinished = await userTester.post('/api/tradings', fakeTradingData[6]);
      expect(repFinished.status).toEqual(HttpStatus.CREATED);
      const tiFinished = repFinished.body as TradingInfoDto;

      // 시간 순으로 정렬되고, 매수-매도 묶음 단위로 처리되었나?
      expect(4).toEqual(tiFinished.list.length);
      /* eslint-disable */
      testDataHelper.expectTrading(tiFinished.list[0], fakeTradingData[8].tradingAt, fakeTradingData[9].tradingAt, 1000, 1000, 0, 2);
      testDataHelper.expectTrading(tiFinished.list[1], fakeTradingData[5].tradingAt, fakeTradingData[7].tradingAt, 1500, 2000, 0, 3);
      testDataHelper.expectTrading(tiFinished.list[2], fakeTradingData[2].tradingAt, fakeTradingData[4].tradingAt, 1000, 1000, 0, 3);
      testDataHelper.expectTrading(tiFinished.list[3], fakeTradingData[0].tradingAt, fakeTradingData[1].tradingAt, 1000, 1000, 0, 2);
      /* eslint-enable */
    });

    it('Test add trading - 매도 먼저 입력 시 체크', async () => {
      const prepareTestData = async (emailId: string) => {
        const userTester = await getUserTester(emailId);
        const cService = testingHelper.getService<CorparationService>(CorparationService);

        // 종목코드 생성
        await cService.initializeCorpCodes(true);
        const isuSrtCdTarget = 'KOSPI';

        const fakeData = testDataHelper.fakeTradingInputData(isuSrtCdTarget);

        return {
          userTester,
          isuSrtCdTarget,
          fakeData,
        };
      };
      const { userTester, isuSrtCdTarget, fakeData } = await prepareTestData('otestTrading005');

      const rep1 = await userTester.post('/api/tradings', fakeData[1]);
      rep1.status !== HttpStatus.CREATED ? console.log('---->', rep1.error) : '';
      expect(rep1.status).toEqual(HttpStatus.CREATED);
      const tid1 = rep1.body as TradingInfoDto;
      testDataHelper.expectTrading(tid1.list[0], fakeData[1].tradingAt, null, 0, 1000, -10, 1);

      const rep2 = await userTester.post('/api/tradings', fakeData[2]);
      rep2.status !== HttpStatus.CREATED ? console.log('---->', rep2.error) : '';
      expect(rep2.status).toEqual(HttpStatus.CREATED);
      const tid2 = rep2.body as TradingInfoDto;
      expect(2).toEqual(tid2.list.length);
      testDataHelper.expectTrading(tid2.list[0], fakeData[2].tradingAt, null, 1000, 0, 10, 1);
      testDataHelper.expectTrading(tid2.list[1], fakeData[1].tradingAt, null, 0, 1000, -10, 1);

      await userTester.post('/api/tradings', fakeData[3]);
      await userTester.post('/api/tradings', fakeData[4]);
      await userTester.post('/api/tradings', fakeData[5]);
      await userTester.post('/api/tradings', fakeData[6]);
      await userTester.post('/api/tradings', fakeData[7]);
      await userTester.post('/api/tradings', fakeData[8]);
      await userTester.post('/api/tradings', fakeData[9]);

      const repLast = await userTester.post('/api/tradings', fakeData[0]);
      const tidLast = repLast.body as TradingInfoDto;
      testDataHelper.expectLast(tidLast, isuSrtCdTarget);
    });

    it('Test add trading - 랜덤 입력 체크', async () => {
      const prepareTestData = async (emailId: string) => {
        const userTester = await getUserTester(emailId);
        const cService = testingHelper.getService<CorparationService>(CorparationService);

        // 종목코드 생성
        await cService.initializeCorpCodes(true);
        const isuSrtCdTarget = 'KOSPI';

        const fakeData = testDataHelper.fakeTradingInputData(isuSrtCdTarget);
        function shuffle(a: TradingTrxDto[]) {
          let j, x, i;
          for (i = a.length; i; i -= 1) {
            j = Math.floor(Math.random() * i);
            x = a[i - 1];
            a[i - 1] = a[j];
            a[j] = x;
          }
        }
        shuffle(fakeData);

        return {
          userTester,
          isuSrtCdTarget,
          fakeData,
        };
      };
      const { userTester, isuSrtCdTarget, fakeData } = await prepareTestData('otestTrading004');

      const tids = await reducePromises(fakeData, async (ttd) => {
        const rep = await userTester.post('/api/tradings', ttd);
        rep.status !== HttpStatus.CREATED ? console.log('---->', rep.error) : '';
        expect(rep.status).toEqual(HttpStatus.CREATED);
        return rep.body as TradingInfoDto;
      });

      testDataHelper.expectLast(tids[tids.length - 1], isuSrtCdTarget);
    });
  });

  it('Test modify trading', async () => {
    const prepareTestData = async (emailId: string) => {
      const userTester = await getUserTester(emailId);
      const cService = testingHelper.getService<CorparationService>(CorparationService);

      // 종목코드 생성
      await cService.initializeCorpCodes(true);
      const isuSrtCdTarget = 'KOSPI';

      const fakeData = testDataHelper.fakeTradingInputData(isuSrtCdTarget);
      await reducePromises(fakeData, async (ttd) => {
        const rep = await userTester.post('/api/tradings', ttd);
        rep.status !== HttpStatus.CREATED ? console.log('---->', rep.error) : '';
        expect(rep.status).toEqual(HttpStatus.CREATED);
      });
      const repTrading = await userTester.get('/api/tradings');
      expect(repTrading.status).toEqual(HttpStatus.OK);
      const tidTarget = repTrading.body as TradingInfoDto;

      return {
        userTester,
        isuSrtCdTarget,
        fakeData,
        tidTarget,
      };
    };
    const { userTester, fakeData, tidTarget } = await prepareTestData('otestTModify001');

    const ttdTarget = { ...fakeData[1] }; // 수량 수정
    ttdTarget.id = tidTarget.list[tidTarget.list.length - 1].tradingTrxes[1].id; // 첫번째 거래의 매도 (역순)
    ttdTarget.cnt = 5; // 10 -> 5개 매도로 조정, 모두 재정렬
    const repModify = await userTester.put('/api/tradings', ttdTarget);
    repModify.status !== HttpStatus.OK ? console.log('---->', repModify.error) : '';
    expect(repModify.status).toEqual(HttpStatus.OK);
    const tidModify = repModify.body as TradingInfoDto;
    expect(1).toEqual(tidModify.list.length);
    expect(tidModify.list[0].remainCount).toEqual(5);

    const ttdTarget2 = { ...fakeData[7] };
    ttdTarget2.id = tidTarget.list[1].tradingTrxes[2].id; // 7번째 거래의 매도 수량 - 완료되도록
    ttdTarget2.cnt = 25; // 20 -> 25개 재정렬
    const repModify2 = await userTester.put('/api/tradings', ttdTarget2);
    repModify2.status !== HttpStatus.OK ? console.log('---->', repModify2.error) : '';
    expect(repModify2.status).toEqual(HttpStatus.OK);
    const tidModify2 = repModify2.body as TradingInfoDto;
    expect(2).toEqual(tidModify2.list.length);
  });

  it('Test remove trading', async () => {
    const prepareTestData = async (emailId: string) => {
      const userTester = await getUserTester(emailId);
      const cService = testingHelper.getService<CorparationService>(CorparationService);

      // 종목코드 생성
      await cService.initializeCorpCodes(true);
      const isuSrtCdTarget = 'KOSPI';

      const fakeData = testDataHelper.fakeTradingInputData(isuSrtCdTarget);
      await reducePromises(fakeData, async (ttd) => {
        const rep = await userTester.post('/api/tradings', ttd);
        rep.status !== HttpStatus.CREATED ? console.log('---->', rep.error) : '';
        expect(rep.status).toEqual(HttpStatus.CREATED);
      });
      const repTrading = await userTester.get('/api/tradings');
      expect(repTrading.status).toEqual(HttpStatus.OK);
      const tidTarget = repTrading.body as TradingInfoDto;

      return {
        userTester,
        isuSrtCdTarget,
        fakeData,
        tidTarget,
      };
    };
    const { userTester, fakeData, tidTarget } = await prepareTestData('otestTRemove001');

    const ttdTarget = { ...fakeData[4] }; // 수량 수정
    ttdTarget.id = tidTarget.list[2].tradingTrxes[2].id; // 첫번째 거래의 매도 (역순)
    const repDel = await userTester.delete(`/api/tradings/${ttdTarget.isuSrtCd}/${ttdTarget.id}`);
    repDel.status !== HttpStatus.OK ? console.log('---->', repDel.error) : '';
    expect(repDel.status).toEqual(HttpStatus.OK);
    const tidRemove = repDel.body as TradingInfoDto;
    expect(2).toEqual(tidRemove.list.length);
    expect(tidRemove.list[0].remainCount).toEqual(20);
  });
});
