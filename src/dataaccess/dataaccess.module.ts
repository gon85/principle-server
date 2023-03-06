import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Corparation from '@src/modules/corparation/entities/corparation.entity';
import StockDailyPrice from '@src/modules/stocks/entities/stock_daily_price.entity';
import TradingMst from '@src/modules/tradings/entities/trading-mst.entity';
import TradingTrx from '@src/modules/tradings/entities/trading-trx.entity';
import { CorpsDao } from './corps/corps.dao';
import { StockDao } from './stocks/stock.dao';
import { TradingDao } from './tradings/trading.dao';

@Module({
  imports: [TypeOrmModule.forFeature([Corparation, StockDailyPrice, TradingMst, TradingTrx])],
  providers: [CorpsDao, StockDao, TradingDao],
  exports: [CorpsDao, StockDao, TradingDao],
})
export class DataaccessModule {}
