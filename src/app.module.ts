import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/app-config.module';
import { MySqlConfigService } from './config/db/mysql-config.service';
import { CorparationModule } from './modules/corparation/corparation.module';
import { AuthModule } from './modules/auth/auth.module';
import { TradingModule } from './modules/tradings/trading.module';
import { StocksModule } from './modules/stocks/stocks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      useClass: MySqlConfigService,
      inject: [MySqlConfigService],
    }),
    CorparationModule,
    AuthModule,
    StocksModule,
    TradingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
