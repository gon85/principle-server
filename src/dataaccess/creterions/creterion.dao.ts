import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import UserCreterion from '@src/modules/creterions/entities/user_creterion.entity';
import StockDailyPrice from '@src/modules/stocks/entities/stock_daily_price.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CreterionDao {
  constructor(
    @InjectRepository(UserCreterion)
    private ucRepo: Repository<UserCreterion>,
  ) {}

  public async findByUserId(userId: number) {
    const qbMain = this.ucRepo.createQueryBuilder('uc').where('uc.user_id = :userId', { userId });
    return qbMain.getOne();
  }
}
