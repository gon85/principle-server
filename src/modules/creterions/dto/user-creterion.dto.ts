import { OmitType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import UserCreterion from '../entities/user_creterion.entity';

export default class UserCreterionDto extends OmitType(UserCreterion, ['userId', 'createdAt', 'updatedAt']) {
  @IsOptional()
  userId?: number;
}
