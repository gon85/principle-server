import { CorparationService } from '@src/modules/corparation/services/corparation.service';
import StockDailyPrice from '@src/modules/stocks/entities/stock_daily_price.entity';
import { DataSource } from 'typeorm';
import { testingHelper } from '../testing-helper';

export class StockSenario {
  public async resetStocks(isuSrtCd: string) {
    const cService = testingHelper.getService<CorparationService>(CorparationService);
    // 종목코드 생성
    await cService.initializeCorpCodes(true);

    const dataSource = testingHelper.getApp().get<DataSource>(DataSource);
    await dataSource.getRepository(StockDailyPrice).delete({ isuSrtCd });
  }

  public async addSDP(sdpParam: StockDailyPrice) {
    const sdpRepo = testingHelper.getRepository<StockDailyPrice>(StockDailyPrice);
    await sdpRepo.insert(sdpParam);
  }

  public async addSDPs(sdpParams: StockDailyPrice[]) {
    const sdpRepo = testingHelper.getRepository<StockDailyPrice>(StockDailyPrice);
    await sdpRepo.insert(sdpParams);
  }
}
