import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TradingTypes } from '../types/enums';
import TradingTrx from './trading-trx.entity';
// import CompanyMst from '../krx/CompanyMst';
// import UserMst from '../user/UserMst';
// import TradingTrx from './TradingTrx';

const tDesc = {
  id: '',
  isuSrtCd: 'KRX 종목코드(short)',

  buyPriceSum: '매수금 합계',
  buyCntSum: '매수량 합계',
  buyPriceAvg: '매수금 평균가',

  sellPriceSum: '매도금 합계',
  sellCntSum: '매도량 합계',
  sellPriceAvg: '매도 평균가',

  remainCount: '남은 수량 (음수 가능)',
  startedAt: '최초 거래일 (최초 매수일)',
  finishedAt: '최종 거래일 (최종 매도일)',
  createdAt: '생성일',
  updatedAt: '수정일',
};

@Entity()
export default class TradingMst {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, comment: tDesc.id })
  id!: number;

  @Column({ type: 'int', unsigned: true })
  userId!: number;

  @Column({ type: 'varchar', length: 12, comment: tDesc.isuSrtCd })
  isuSrtCd!: string;

  @Column({ type: 'int', default: 0, comment: tDesc.buyPriceSum })
  buyPriceSum!: number;

  @Column({ type: 'int', default: 0, comment: tDesc.buyCntSum })
  buyCntSum!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    comment: tDesc.buyPriceAvg,
    transformer: {
      to(data: number): number {
        return data;
      },
      from(data: string): number {
        return Number(data);
      },
    },
  })
  buyPriceAvg!: number;

  @Column({ type: 'int', default: 0, comment: tDesc.sellPriceSum })
  sellPriceSum!: number;

  @Column({ type: 'int', default: 0, comment: tDesc.sellCntSum })
  sellCntSum!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    comment: tDesc.sellPriceAvg,
    transformer: {
      to(data: number): number {
        return data;
      },
      from(data: string): number {
        return Number(data);
      },
    },
  })
  sellPriceAvg!: number;

  @Column({ type: 'int', default: 0, comment: tDesc.remainCount })
  remainCount!: number;

  @Column({ type: 'datetime', comment: tDesc.startedAt })
  startedAt!: Date;

  @Column({ type: 'datetime', nullable: true, comment: tDesc.finishedAt })
  finishedAt!: Date | null;

  @CreateDateColumn({ type: 'datetime', comment: tDesc.createdAt })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', comment: tDesc.updatedAt })
  updatedAt: Date;

  // @ManyToOne(() => UserMst)
  // @JoinColumn({ name: 'user_id' })
  // user!: UserMst;

  // @ManyToOne(() => CompanyMst, { eager: true })
  // @JoinColumn({ name: 'isu_srt_cd' })
  // company!: CompanyMst;

  @OneToMany(() => TradingTrx, (tt) => tt.tradingMst)
  tradingTrxes!: TradingTrx[];

  static calculate(tTarget: TradingMst, tradingTrxes?: TradingTrx[]) {
    tTarget.tradingTrxes = tradingTrxes || tTarget.tradingTrxes;
    const ttTargets = tTarget.tradingTrxes || [];

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
    tTarget.buyPriceAvg = resultCal.sumBuyCnt === 0 ? 0 : Math.floor(resultCal.sumBuyPrice / resultCal.sumBuyCnt);
    tTarget.buyCntSum = resultCal.sumBuyCnt;
    tTarget.sellPriceAvg = resultCal.sumSellCnt === 0 ? 0 : Math.floor(resultCal.sumSellPrice / resultCal.sumSellCnt);
    tTarget.sellCntSum = resultCal.sumSellCnt;
    return tTarget;
  }
}
