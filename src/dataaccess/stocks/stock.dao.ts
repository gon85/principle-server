import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import StockDailyPrice from '@src/modules/stocks/entities/stock_daily_price.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StockDao {
  constructor(
    @InjectRepository(StockDailyPrice)
    private sdpRepo: Repository<StockDailyPrice>,
  ) {}

  public getStockClosePrice(isuSrtCd: string) {
    const qbMain = this.sdpRepo
      .createQueryBuilder('sdp')
      .where('sdp.isu_srt_cd = :isuSrtCd', { isuSrtCd })
      .orderBy('sdp.base_dt', 'DESC');

    return qbMain.getOne();
  }

  /**
   *
   * @param isuSrtCd
   * @param fromDate YYYYMMDD
   * @param toDate YYYMMDD (포함검색)
   */
  public findSDPs(isuSrtCd: string, fromDate: string, toDate?: string, order: 'ASC' | 'DESC' = 'ASC') {
    const qbMain = this.sdpRepo
      .createQueryBuilder('sdp')
      .where('sdp.isu_srt_cd = :isuSrtCd', { isuSrtCd })
      .andWhere('sdp.base_dt >= :fromDate', { fromDate })
      .orderBy('sdp.base_dt', order);

    if (toDate) {
      qbMain.andWhere('sdp.base_dt <= :toDate', { toDate });
    }

    return qbMain.getMany();
  }
}
