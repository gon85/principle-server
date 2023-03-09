import datetimeUtils from '@src/commons/utils/datetime-utils';
import Corparation from '@src/modules/corparation/entities/corparation.entity';
import StockDailyPrice from '@src/modules/stocks/entities/stock_daily_price.entity';
import { StockService } from '@src/modules/stocks/services/stock.service';
import { testingHelper } from '@test/commons/testing-helper';

describe('Test stock service ', () => {
  beforeAll(testingHelper.beforeAll);
  afterAll(testingHelper.afterAll);
  beforeEach(async () => {
    await testingHelper.beforeEach();
  });

  it('Test crawlingDailyPriceByCorp', async () => {
    const service = testingHelper.getService<StockService>(StockService);
    await service.crawlingDailyPriceByCorp('KOSPI', { isReset: true });
    expect(true).toEqual(true);

    const stockRepo = testingHelper.getRepository<StockDailyPrice>(StockDailyPrice);
    const sdps = await stockRepo.find({ where: { isuSrtCd: 'KOSPI' } });
    expect(sdps.length > 0).toBeTruthy();
  });

  it('Test crawlingDailyPriceByDate', async () => {
    const service = testingHelper.getService<StockService>(StockService);
    const baseDt = datetimeUtils.getNowDayjs().add(-1, 'day').format('YYYYMMDD');
    await service.crawlingDailyPriceByDate(baseDt);
    expect(true).toEqual(true);

    const stockRepo = testingHelper.getRepository<StockDailyPrice>(StockDailyPrice);
    const corpRepo = testingHelper.getRepository<Corparation>(Corparation);
    const corp = await corpRepo.createQueryBuilder().orderBy('RAND()', 'ASC').getOne();
    const sdp = await stockRepo.findOneOrFail({
      where: {
        isuSrtCd: corp.isuSrtCd,
        baseDt,
      },
    });
    expect(sdp).toBeTruthy();
  });
});
