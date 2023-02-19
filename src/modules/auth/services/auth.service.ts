import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRegisterDto } from '@src/modules/user/dtos/user-register.dto';
import { UsersService } from '@src/modules/user/services/user.service';
import User from '@src/modules/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) return null;
    if (user.isDeleted) return null;
    if (!user.isActive) {
    }

    const match = await bcrypt.compare(pass, user.pw);
    if (!match) return null;

    return user;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(urDto: UserRegisterDto) {
    return this.usersService.register(urDto);
  }
}
