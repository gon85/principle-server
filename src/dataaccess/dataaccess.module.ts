import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Corparation from '@src/modules/corparation/entities/corparation.entity';
import StockDailyPrice from '@src/modules/stocks/entities/stock_daily_price.entity';
import { CorpsDao } from './corps/corps.dao';
import { StockDao } from './stocks/stock.dao';

@Module({
  imports: [TypeOrmModule.forFeature([Corparation, StockDailyPrice])],
  providers: [CorpsDao, StockDao],
  exports: [CorpsDao, StockDao],
})
export class DataaccessModule {}
