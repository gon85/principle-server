import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserCreterion from '../creterions/entities/user_creterion.entity';
import TradingMst from '../tradings/entities/trading-mst.entity';
import TradingTrx from '../tradings/entities/trading-trx.entity';
import User from '../user/entities/user.entity';
import { AnalysisController } from './controllers/analysis.controller';
import { AnalysisService } from './services/analysis.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserCreterion, TradingMst, TradingTrx])],
  controllers: [AnalysisController],
  providers: [AnalysisService],
})
export class AnalysisModule {}
