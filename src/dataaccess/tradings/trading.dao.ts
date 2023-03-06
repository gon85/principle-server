import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import TradingMst from '@src/modules/tradings/entities/trading-mst.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TradingDao {
  constructor(
    @InjectRepository(TradingMst)
    private tmRepo: Repository<TradingMst>,
  ) {}

  public async findFinishedTrading(userId: number) {
    const qbMain = this.tmRepo
      .createQueryBuilder('tm')
      .leftJoinAndSelect('tm.tradingTrxes', 'tt')
      .where('tm.user_id = :userId', { userId })
      .andWhere('tm.remain_count <= 0')
      .andWhere(
        `tm.isu_srt_cd NOT IN (
                            SELECT isu_srt_cd 
                              FROM trading_mst 
                            WHERE user_id = :userId
                              AND remain_count > 0
        )`,
        { userId },
      );

    return qbMain.getMany();
  }
}
