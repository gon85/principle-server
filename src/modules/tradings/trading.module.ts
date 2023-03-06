import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from '../user/entities/user.entity';
import { TradingController } from './controllers/trading.controller';
import TradingTrx from './entities/trading-trx.entity';
import TradingMst from './entities/trading-mst.entity';
import { TradingService } from './services/trading.service';
import { DataaccessModule } from '@src/dataaccess/dataaccess.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, TradingMst, TradingTrx]), DataaccessModule],
  controllers: [TradingController],
  providers: [TradingService],
})
export class TradingModule {}
