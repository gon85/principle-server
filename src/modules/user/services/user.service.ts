import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DefaultResponseDto } from '@src/commons/dto/default-response.dto';
import { Repository } from 'typeorm';
import { UserRegisterDto } from '../dtos/user-register.dto';
import User from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private uRepo: Repository<User>,
  ) {}

  public async getUserByEmail(email: string): Promise<User | undefined> {
    return this.uRepo.findOne({ where: { email } });
  }

  public async register(urDto: UserRegisterDto) {
    await this.uRepo.insert(urDto);
    return DefaultResponseDto.createSuccess();
  }
}
