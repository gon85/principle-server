import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class TasksService implements OnModuleInit {
  private readonly logger = new Logger(TasksService.name);

  constructor(private configService: ConfigService, private schedulerRegistry: SchedulerRegistry) {}

  onModuleInit() {
    const cronSdp = this.configService.get<string>('CRON_SDP');
    if (cronSdp) {
      const job = new CronJob(cronSdp, this.handleCron);

      this.schedulerRegistry.addCronJob('conr_sdp', job);
      job.start();
    }
  }

  // @Cron('* * * * * *')
  handleCron() {
    // logger.debug('Called when the current second is 45');
    console.log('----> ????');
  }
}
