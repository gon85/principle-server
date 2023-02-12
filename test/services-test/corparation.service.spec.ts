import { CorparationService } from '@src/modules/corparation/services/corparation.service';
import { testingHelper } from '@test/commons/testing-helper';

describe('Test corparation service ', () => {
  beforeAll(testingHelper.beforeAll);
  afterAll(testingHelper.afterAll);
  beforeEach(async () => {
    await testingHelper.beforeEach();
  });

  it('Test initializeCorpCodes', async () => {
    const service = testingHelper.getService<CorparationService>(CorparationService);
    await service.initializeCorpCodes();
    expect(true).toEqual(true);
  });
});
