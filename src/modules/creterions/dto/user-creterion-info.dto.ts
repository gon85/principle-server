import { ApiProperty } from '@nestjs/swagger';
import UserAlarm from '../entities/user_alarm.entity';
import UserCreterion from '../entities/user_creterion.entity';

export default class UserCreterionInfoDto {
  @ApiProperty({
    description: '이용자 투자원칙 기준정보',
    type: UserCreterion,
  })
  creterion?: UserCreterion;

  @ApiProperty({
    description: '이용자 알람 정보',
    type: UserAlarm,
    isArray: true,
  })
  alarms?: UserAlarm[];
}
