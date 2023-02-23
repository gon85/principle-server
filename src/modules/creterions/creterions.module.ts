import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from '../user/entities/user.entity';
import { CreterionsController } from './controllers/creterion.controller';
import UserAlarm from './entities/user_alarm.entity';
import UserCreterion from './entities/user_creterion.entity';
import { CreterionService } from './services/creterion.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserCreterion, UserAlarm])],
  controllers: [CreterionsController],
  providers: [CreterionService],
})
export class CreterionsModule {}
