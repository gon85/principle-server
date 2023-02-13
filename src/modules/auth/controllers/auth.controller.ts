import { Controller, Request, Post, UseGuards, Get, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRegisterDto } from '@src/modules/user/dtos/user-register.dto';
import { UsersService } from '@src/modules/user/services/user.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService, private userService: UsersService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    // return req.user;
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() urDto: UserRegisterDto) {
    return this.userService.register(urDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
