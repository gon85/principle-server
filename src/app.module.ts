import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { CreterionsModule } from './modules/creterions/creterions.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './commons/Interceptors/logging-Interceptor';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { DataaccessModule } from './dataaccess/dataaccess.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerModule } from './modules/schedulers/scheduler.module';
import { LoggerMiddleware } from './commons/middlewares/logger.middleware';

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
    ScheduleModule.forRoot(),
    SchedulerModule,
    DataaccessModule,
    CorparationModule,
    AuthModule,
    StocksModule,
    TradingModule,
    CreterionsModule,
    AnalysisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
