import Corparation from '@src/modules/corparation/entities/corparation.entity';
import UserCorpStats from '@src/modules/user/entities/user-corp-stats.entity';
import StockDailyPrice from '../entities/stock_daily_price.entity';

export class StockPriceInfoDto {
  corparation: Corparation;
  userCorpStats?: UserCorpStats;
  stockDailyPrices: StockDailyPrice[];
}
