import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

const sdtDesc = {
  isuSrtCd: '',
  trdDd: '',
  tddClsprc: '종가',
  flucRt: '전일대비%',
  tddCmpr: '전일대비',
  accTrdvol: '거래대금',
  accTrdval: '거래량',
  tddOpnprc: '시가',
  tddHgprc: '고가',
  tddLwprc: '저가',
  mktcap: '시가 총액',
  listShrs: '주식 발행수',

  basDt: '기준일자',
  mrktCtg: '주식의 시장 구분 (KOSPI/KOSDAQ/KONEX 중 1)',
  clpr: '정규시장의 매매시간종료시까지 형성되는 최종가격',
  vs: '전일 대비 등락',
  fltRt: '전일 대비 등락에 따른 비율',
  mkp: '정규시장의 매매시간개시후 형성되는 최초가격',
  hipr: '하루 중 가격의 최고치',
  lopr: '하루 중 가격의 최저치',
  trqu: '체결수량의 누적 합계 (거래량)',
  trPrc: '거래건 별 체결가격 * 체결수량의 누적 합계 (거래대금)',
  lstgStCnt: '종목의 상장주식수',
  mrktTotAmt: '종가 * 상장주식수  ',
};

@Entity({ name: 'stock_daily_price' })
export default class StockDailyPrice {
  @PrimaryColumn({
    type: 'varchar',
    length: 12,
    comment: sdtDesc.isuSrtCd,
  })
  isuSrtCd!: string;

  @PrimaryColumn({ type: 'varchar', length: 12, comment: sdtDesc.basDt })
  baseDt!: string;

  @Column({ type: 'int', unsigned: true, comment: sdtDesc.clpr })
  clpr!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    nullable: true,
    comment: sdtDesc.fltRt,
  })
  fltRt?: number;

  @Column({ type: 'int', nullable: true, comment: sdtDesc.vs })
  vs?: number;

  @Column({ type: 'int', unsigned: true, comment: sdtDesc.mkp })
  mkp!: number;

  @Column({ type: 'int', unsigned: true, comment: sdtDesc.hipr })
  hipr!: number;

  @Column({ type: 'int', unsigned: true, comment: sdtDesc.lopr })
  lopr!: number;

  @Column({ type: 'int', unsigned: true, comment: sdtDesc.trqu })
  trqu!: number;

  @Column({ type: 'int', unsigned: true, nullable: true, comment: sdtDesc.trPrc })
  trPrc?: number;

  @Column({ type: 'int', unsigned: true, nullable: true, comment: sdtDesc.lstgStCnt })
  lstgStCnt?: number;

  @Column({ type: 'int', unsigned: true, nullable: true, comment: sdtDesc.mrktTotAmt })
  mrktTotAmt?: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}
