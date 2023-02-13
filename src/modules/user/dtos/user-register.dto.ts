import { PickType } from '@nestjs/swagger';
import User from '../entities/user.entity';

export class UserRegisterDto extends PickType(User, ['email', 'pw', 'firstName', 'lastName']) {}
