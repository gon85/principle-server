import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from '../user/entities/user.entity';
import { TradingController } from './controllers/trading.controller';
import TradingTrx from './entities/trading-trx.entity';
import Trading from './entities/trading.entity';
import { TradingService } from './services/trading.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Trading, TradingTrx])],
  controllers: [TradingController],
  providers: [TradingService],
})
export class TradingModule {}