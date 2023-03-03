import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataaccessModule } from '@src/dataaccess/dataaccess.module';
import UserCreterion from '../creterions/entities/user_creterion.entity';
import { StocksModule } from '../stocks/stocks.module';
import TradingMst from '../tradings/entities/trading-mst.entity';
import TradingTrx from '../tradings/entities/trading-trx.entity';
import User from '../user/entities/user.entity';
import { AnalysisController } from './controllers/analysis.controller';
import { AnalysisService } from './services/analysis.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserCreterion, TradingMst, TradingTrx]), DataaccessModule, StocksModule],
  controllers: [AnalysisController],
  providers: [AnalysisService],
})
export class AnalysisModule {}
