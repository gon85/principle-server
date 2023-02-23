import { HttpStatus } from '@nestjs/common';
import UserAlarmDto from '@src/modules/creterions/dto/user-alarm.dto';
import UserCreterionDto from '@src/modules/creterions/dto/user-creterion.dto';
import { getUserTester, testingHelper } from './commons/testing-helper';

describe('Test creterions e2e ', () => {
  beforeAll(testingHelper.beforeAll);
  afterAll(testingHelper.afterAll);
  beforeEach(async () => {
    await testingHelper.beforeEach();
  });

  it('Test crud creterions', async () => {
    const prepareTestData = async (emailId: string) => {
      const userTester = await getUserTester(emailId);
      return {
        userTester,
      };
    };
    const { userTester } = await prepareTestData('otestCreterion001');

    const repUCI = await userTester.get('/api/creterions', {});
    repUCI.status !== HttpStatus.OK ? console.log('---->', repUCI.error) : '';
    expect(repUCI.status).toEqual(HttpStatus.OK);
    expect(repUCI.body.creterion).toBeFalsy();
    expect(repUCI.body.alarms.length).toEqual(0);

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
    const ucSaved = repUCSaved.body as UserCreterionDto;
    expect(ucSaved.targetProfitRatio).toEqual(ucdTarget.targetProfitRatio);
    expect(ucSaved.maxFocusInterestCnt).toEqual(ucdTarget.maxFocusInterestCnt);

    const uadTarget = {
      alarmCategoryCd: 'AT',
      time: '22:00',
      isUse: true,
    } as UserAlarmDto;
    const repUAaved = await userTester.post('/api/creterions/alarm', uadTarget);
    repUAaved.status !== HttpStatus.CREATED ? console.log('---->', repUAaved.error) : '';
    expect(repUAaved.status).toEqual(HttpStatus.CREATED);
    const uaSaveds = repUAaved.body as UserAlarmDto[];
    expect(uaSaveds.length).toEqual(1);
    expect(uaSaveds[0].alarmCategoryCd).toEqual(uadTarget.alarmCategoryCd);
    expect(uaSaveds[0].time).toEqual(uadTarget.time);

    const repUCISaved = await userTester.get('/api/creterions', {});
    repUCISaved.status !== HttpStatus.OK ? console.log('---->', repUCISaved.error) : '';
    expect(repUCISaved.status).toEqual(HttpStatus.OK);
    expect(repUCISaved.body.creterion).not.toBeUndefined();
    expect(repUCISaved.body.alarms).not.toBeUndefined();
    expect(repUCISaved.body.creterion.targetProfitRatio).toEqual(ucdTarget.targetProfitRatio);
    expect(repUCISaved.body.creterion.maxFocusInterestCnt).toEqual(ucdTarget.maxFocusInterestCnt);
    expect(repUCISaved.body.creterion.maxLossRatio).toEqual(ucdTarget.maxLossRatio);
    expect(repUCISaved.body.alarms[0].alarmCategoryCd).toEqual(uadTarget.alarmCategoryCd);
    expect(repUCISaved.body.alarms[0].time).toEqual(uadTarget.time);

    ucdTarget.targetProfitRatio = 20.5;
    const repUCModified = await userTester.post('/api/creterions', ucdTarget);
    repUCModified.status !== HttpStatus.CREATED ? console.log('---->', repUCModified.error) : '';
    expect(repUCModified.status).toEqual(HttpStatus.CREATED);
    const ucModified = repUCModified.body as UserCreterionDto;
    expect(ucModified.targetProfitRatio).toEqual(ucdTarget.targetProfitRatio);
  });
});
