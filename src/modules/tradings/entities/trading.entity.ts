import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TradingTypes } from '../types/enums';
import TradingTrx from './trading-trx.entity';
// import CompanyMst from '../krx/CompanyMst';
// import UserMst from '../user/UserMst';
// import TradingTrx from './TradingTrx';

const tDesc = {
  id: '',
  isuSrtCd: 'KRX 종목코드(short)',
  avgBuyPrice: '매수금 평균가',
  sumBuyCnt: '매수금합계',
  avgSellPrice: '매도 평균가',
  sumSellCnt: '매도금합계',
  remainCount: '남은 수량',
  startedAt: '최초 거래일 (최초 매수일)',
  finishedAt: '최종 거래일 (최종 매도일)',
  createdAt: '생성일',
  updatedAt: '수정일',
};

@Entity()
export default class Trading {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, comment: tDesc.id })
  id!: number;

  @Column({ type: 'int', unsigned: true })
  userId!: number;

  @Column({ type: 'varchar', length: 12, comment: tDesc.isuSrtCd })
  isuSrtCd!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, comment: tDesc.avgBuyPrice })
  avgBuyPrice!: number;

  @Column({ type: 'int', default: 0, comment: tDesc.sumBuyCnt })
  sumBuyCnt!: number;

  @Column({ type: 'int', precision: 12, scale: 2, default: 0, comment: tDesc.avgSellPrice })
  avgSellPrice!: number;

  @Column({ type: 'int', default: 0, comment: tDesc.sumSellCnt })
  sumSellCnt!: number;

  @Column({ type: 'int', default: 0, comment: tDesc.remainCount })
  remainCount!: number;

  @Column({ type: 'datetime', comment: tDesc.startedAt })
  startedAt!: Date;

  @Column({ type: 'datetime', nullable: true, comment: tDesc.finishedAt })
  finishedAt!: Date | null;

  @CreateDateColumn({ type: 'datetime', comment: tDesc.createdAt })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', comment: tDesc.updatedAt })
  updatedAt!: Date;

  // @ManyToOne(() => UserMst)
  // @JoinColumn({ name: 'user_id' })
  // user!: UserMst;

  // @ManyToOne(() => CompanyMst, { eager: true })
  // @JoinColumn({ name: 'isu_srt_cd' })
  // company!: CompanyMst;

  @OneToMany(() => TradingTrx, (tt) => tt.trading)
  tradingTrxes!: TradingTrx[];

  static calculate(tTarget: Trading, tradingTrxes?: TradingTrx[]) {
    const ttTargets = tTarget.tradingTrxes || tradingTrxes || [];

    const resultCal = ttTargets.reduce(
      (acc, tt, index) => {
        if (index === 0) {
          tTarget.startedAt = tt.tradingAt;
        }
        // if (index === ttTargets.length - 1) {
        //   tTarget.finishedAt = tt.tradingAt;
        // }
        if (tt.tradingTypeCd === TradingTypes.Buy) {
          acc.sumBuyPrice += tt.price * tt.cnt; // 매수총합 (단가 합이 아닌)
          acc.sumBuyCnt += tt.cnt;
        } else {
          acc.sumSellPrice += tt.price * tt.cnt; // 매수총합 (단가 합이 아닌)
          acc.sumSellCnt += tt.cnt;
        }
        return acc;
      },
      { sumBuyPrice: 0, sumBuyCnt: 0, sumSellPrice: 0, sumSellCnt: 0 },
    );

    tTarget.remainCount = resultCal.sumBuyCnt - resultCal.sumSellCnt;
    if (tTarget.remainCount === 0) {
      tTarget.finishedAt = ttTargets[ttTargets.length - 1].tradingAt;
    }
    tTarget.avgBuyPrice = resultCal.sumBuyCnt === 0 ? 0 : Math.floor(resultCal.sumBuyPrice / resultCal.sumBuyCnt);
    tTarget.sumBuyCnt = resultCal.sumBuyCnt;
    tTarget.avgSellPrice = resultCal.sumSellCnt === 0 ? 0 : Math.floor(resultCal.sumSellPrice / resultCal.sumSellCnt);
    tTarget.sumSellCnt = resultCal.sumSellCnt;
    return tTarget;
  }
}
