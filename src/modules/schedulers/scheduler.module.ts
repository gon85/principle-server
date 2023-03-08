import { Module } from '@nestjs/common';
import { TasksService } from './services/tasks.services';

@Module({
  imports: [],
  providers: [TasksService],
  exports: [TasksService],
})
export class SchedulerModule {}
