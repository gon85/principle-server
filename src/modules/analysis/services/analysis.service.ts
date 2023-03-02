import { InjectRepository } from '@nestjs/typeorm';
import { ErrorCodes, ErrorHandler } from '@src/commons/errorhandler';
import datetimeUtils from '@src/commons/utils/datetime-utils';
import UserCreterion from '@src/modules/creterions/entities/user_creterion.entity';
import TradingMst from '@src/modules/tradings/entities/trading-mst.entity';
import User from '@src/modules/user/entities/user.entity';
import { Repository } from 'typeorm';
import { AnalysisResultDto } from '../dto/analysis-corp-stock.dto';
import { AnalysisPeriodDto } from '../dto/analysis-period.dto';

export class AnalysisService {
  constructor(
    @InjectRepository(User)
    private uRepo: Repository<User>,
    @InjectRepository(TradingMst)
    private tmRepo: Repository<TradingMst>,
  ) {}

  public async analyseCorpStock(userId: number, isuSrtCd: string, tmId?: number) {
    const userInfo = await this.getUserInfo(userId);
    const tmTarget = await this.getTradingByIsuCrt(userId, isuSrtCd, tmId);

    const result = new AnalysisResultDto();
    result.isuSrtCd = isuSrtCd;
    result.period = this.forPeriod(tmTarget, userInfo.creterion);

    return result;
  }

  private forPeriod(tmTarget: TradingMst, uc: UserCreterion) {
    const firstTradingAt = datetimeUtils.getDayjs(tmTarget.startedAt);
    const lastTradingAt = datetimeUtils.getDayjs(tmTarget.tradingTrxes[tmTarget.tradingTrxes.length - 1].tradingAt);
    const nowDayjs = datetimeUtils.getNowDayjs();

    const diffUnit = uc.investmentPeriodUnit === 'M' ? 'M' : 'w';
    const durationTime = Number(nowDayjs.diff(firstTradingAt, diffUnit, true).toFixed(2));
    const exceedTime = durationTime - uc.investmentPeriod;
    const exceedDate =
      exceedTime <= 0
        ? 0
        : datetimeUtils
            .getNowDayjs()
            .diff(datetimeUtils.getDayjs(firstTradingAt).add(uc.investmentPeriod, diffUnit), 'd');
    return AnalysisPeriodDto.createBy({
      investmentPeriod: uc.investmentPeriod,
      durationTime,
      timeUint: uc.investmentPeriodUnit,
      exceedTime,
      exceedDate,
      lastTradingAt: lastTradingAt.toDate(),
    });
  }

  private async getTradingByIsuCrt(userId: number, isuSrtCd: string, tmId?: number) {
    const qbMain = this.tmRepo
      .createQueryBuilder('tm')
      .innerJoinAndSelect('tm.tradingTrxes', 'tt')
      .where('tm.user_id = :userId', { userId })
      .andWhere('tm.isu_srt_cd = :isuSrtCd', { isuSrtCd })
      .orderBy('tm.started_at', 'DESC')
      .addOrderBy('tt.trading_at', 'ASC');
    if (tmId) {
      qbMain.andWhere('tm.id = :id', { id: tmId });
    }

    const tmTarget = await qbMain.getOne();
    ErrorHandler.checkThrow(!tmTarget, ErrorCodes.NOT_FOUND_USER);

    return tmTarget as TradingMst;
  }

  private async getUserInfo(userId: number) {
    const qbMain = this.uRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.creterion', 'uc')
      .leftJoinAndSelect('u.alarms', 'ua')
      .where('u.id = :userId', { userId });

    const userInfo = await qbMain.getOne();
    ErrorHandler.checkThrow(!userInfo, ErrorCodes.NOT_FOUND_USER);

    return userInfo as User;
  }
}
