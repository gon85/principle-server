import { Module } from '@nestjs/common';
import { MySqlConfigService } from './db/mysql-config.service';

@Module({
  providers: [MySqlConfigService],
})
export class AppConfigModule {}
