import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataaccessModule } from '@src/dataaccess/dataaccess.module';
import Corparation from '../corparation/entities/corparation.entity';
import UserCorpHst from '../user/entities/user-corp-hst';
import UserCorpStats from '../user/entities/user-corp-stats.entity';
import { StockController } from './controllers/stock.controller';
import StockDailyPrice from './entities/stock_daily_price.entity';
import { StockService } from './services/stock.service';

@Module({
  imports: [TypeOrmModule.forFeature([StockDailyPrice, Corparation, UserCorpHst, UserCorpStats]), DataaccessModule],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StocksModule {}
