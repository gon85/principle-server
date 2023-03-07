import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Corparation from '@src/modules/corparation/entities/corparation.entity';
import UserCreterion from '@src/modules/creterions/entities/user_creterion.entity';
import StockDailyPrice from '@src/modules/stocks/entities/stock_daily_price.entity';
import TradingMst from '@src/modules/tradings/entities/trading-mst.entity';
import TradingTrx from '@src/modules/tradings/entities/trading-trx.entity';
import { CorpsDao } from './corps/corps.dao';
import { CreterionDao } from './creterions/creterion.dao';
import { StockDao } from './stocks/stock.dao';
import { TradingDao } from './tradings/trading.dao';

@Module({
  imports: [TypeOrmModule.forFeature([Corparation, StockDailyPrice, TradingMst, TradingTrx, UserCreterion])],
  providers: [CorpsDao, StockDao, TradingDao, CreterionDao],
  exports: [CorpsDao, StockDao, TradingDao, CreterionDao],
})
export class DataaccessModule {}
