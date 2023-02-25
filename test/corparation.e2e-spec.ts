import { HttpStatus } from '@nestjs/common';
import Corparation from '@src/modules/corparation/entities/corparation.entity';
import { CorparationService } from '@src/modules/corparation/services/corparation.service';
import { getUserTester, testingHelper } from './commons/testing-helper';

describe('Test corparation e2e ', () => {
  beforeAll(testingHelper.beforeAll);
  afterAll(testingHelper.afterAll);
  beforeEach(async () => {
    await testingHelper.beforeEach();
  });

  it('Test init corps and get corps', async () => {
    const prepareTestData = async (emailId: string) => {
      const userTester = await getUserTester(emailId);

      // 최소...
      const cService = testingHelper.getService<CorparationService>(CorparationService);
      await cService.initializeCorpCodes(true);

      return {
        userTester,
      };
    };
    const { userTester } = await prepareTestData('otestCorps001');

    const repList = await userTester.get('/api/corps', {});
    repList.status !== HttpStatus.OK ? console.log('---->', repList.error) : '';
    expect(repList.status).toEqual(HttpStatus.OK);
    const corpses = repList.body as Corparation[];
    expect(corpses.length >= 2).toBeTruthy();
  });
});
