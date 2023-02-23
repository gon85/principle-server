import { OmitType } from '@nestjs/swagger';
import UserAlarm from '../entities/user_alarm.entity';

export default class UserAlarmDto extends OmitType(UserAlarm, ['userId', 'createdAt', 'updatedAt']) {
  userId?: number;
}
