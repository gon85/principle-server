import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import PageInfoDto from '@src/commons/dto/page-info.dto';
import TradingMst from '@src/modules/tradings/entities/trading-mst.entity';
import { IsNull, MoreThanOrEqual, Not, Repository } from 'typeorm';

@Injectable()
export class TradingDao {
  constructor(
    @InjectRepository(TradingMst)
    private tmRepo: Repository<TradingMst>,
  ) {}

  public async findTotalCount(userId: number) {
    return await this.tmRepo.count({
      where: {
        userId,
      },
    });
  }

  public async findHoldingNCount(userId: number, pageInfo: PageInfoDto) {
    return this.tmRepo.findAndCount({
      relations: ['tradingTrxes'],
      where: {
        userId,
        remainCount: MoreThanOrEqual(0),
        finishedAt: IsNull(),
      },
      order: {
        startedAt: 'DESC',
      },
      skip: pageInfo.skip,
      take: pageInfo.countPerPage,
    });
  }

  public async findFinishedNCount(userId: number, skip: number, take: number) {
    return this.tmRepo.find({
      relations: ['tradingTrxes'],
      where: {
        userId,
        remainCount: 0,
        finishedAt: Not(IsNull()), // LessThan(Utils.date.getNowDayjs().add(1, 'day').format(Utils.date.YYYYsMMsDD)),
      },
      order: {
        finishedAt: 'DESC',
        startedAt: 'DESC',
      },
      skip,
      take,
    });
  }

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
