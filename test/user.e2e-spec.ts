import { HttpStatus } from '@nestjs/common';
import reducePromises from '@src/commons/utils/reduce-promise';
import UserAlarmDto from '@src/modules/creterions/dto/user-alarm.dto';
import UserCreterionDto from '@src/modules/creterions/dto/user-creterion.dto';
import { fakeDataHelper } from './commons/fake-data-helper';
import { getUserTester, testingHelper } from './commons/testing-helper';

describe('NOT Test user e2e ', () => {
  beforeAll(testingHelper.beforeAll);
  afterAll(testingHelper.afterAll);
  beforeEach(async () => {
    await testingHelper.beforeEach();
  });

  it('NOT Test 개발을 위한 정상적인 이용자 생성', async () => {
    const prepareTestData = async (emailId: string) => {
      const userTester = await getUserTester(emailId);
      return {
        userTester,
      };
    };
    const { userTester } = await prepareTestData('otest001');

    const ucdTarget: UserCreterionDto = {
      targetProfitRatio: 10,
      maxLossRatio: 5,
      investmentPeriod: 1,
      investmentPeriodUnit: 'M',
      maxHoldCorpCnt: 3,
      maxBuyingAmount: 2000000,
      maxFocusInterestCnt: 5,
    };
    const repUCSaved = await userTester.post('/api/creterions', ucdTarget);
    repUCSaved.status !== HttpStatus.CREATED ? console.log('---->', repUCSaved.error) : '';
    expect(repUCSaved.status).toEqual(HttpStatus.CREATED);

    const uadTarget = {
      alarmCategoryCd: 'AT',
      time: '22:00',
      isUse: true,
    } as UserAlarmDto;
    const repUAaved = await userTester.post('/api/creterions/alarm', uadTarget);
    repUAaved.status !== HttpStatus.CREATED ? console.log('---->', repUAaved.error) : '';
    expect(repUAaved.status).toEqual(HttpStatus.CREATED);

    const fakeTradingData = fakeDataHelper.fakeTradingInputData('KOSPI');
    await reducePromises(fakeTradingData, async (ttd) => {
      const rep = await userTester.post('/api/tradings', ttd);
      rep.status !== HttpStatus.CREATED ? console.log('---->', rep.error) : '';
      expect(rep.status).toEqual(HttpStatus.CREATED);
    });
  });
});
