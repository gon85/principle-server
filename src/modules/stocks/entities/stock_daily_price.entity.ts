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

  @Column({ type: 'bigint', unsigned: true, nullable: true, comment: sdtDesc.trPrc })
  trPrc?: BigInt;

  @Column({ type: 'bigint', unsigned: true, nullable: true, comment: sdtDesc.lstgStCnt })
  lstgStCnt?: BigInt;

  @Column({ type: 'bigint', unsigned: true, nullable: true, comment: sdtDesc.mrktTotAmt })
  mrktTotAmt?: BigInt;

  @CreateDateColumn({ type: 'datetime' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt?: Date;

  // basDt:'20230307'
  // bssIdxClpr:'319.8'
  // bssIdxIdxNm:'코스피 200'
  // clpr:'15150'
  // fltRt:'-1.01'
  // hipr:'15400'
  // isinCd:'KR7122630007'
  // itmsNm:'KODEX 레버리지'
  // lopr:'15150'
  // mkp:'15245'
  // mrktTotAmt:'1904355000000'
  // nav:'15264.81'
  // nPptTotAmt:'2022586664514'
  // srtnCd:'122630'
  // stLstgCnt:'125700000'
  // trPrc:'247637892975'
  // trqu:'16212545'
  // vs:'-155'
  static createByEtf(isuSrtCd: string, datagoEtf: any) {
    const { basDt, mrktCtg, clpr, vs, fltRt, mkp, hipr, lopr, trqu, trPrc, mrktTotAmt } = datagoEtf;
    return {
      isuSrtCd,
      baseDt: basDt,
      mrktCtg,
      clpr,
      vs,
      fltRt,
      mkp,
      hipr,
      lopr,
      trqu,
      trPrc,
      mrktTotAmt,
    } as StockDailyPrice;
  }

  // basDt:  '20230307'
  // basIdx:  '100'
  // basPntm:  '19800104'
  // clpr:  '2463.35'
  // epyItmsCnt:  '820'
  // fltRt:  '.03'
  // hipr:  '2475.73'
  // idxCsf:  'KOSPI시리즈'
  // idxNm:  '코스피'
  // lopr:  '2455.65'
  // lstgMrktTotAmt:  '1945941991553062'
  // lsYrEdVsFltRg:  '227'
  // lsYrEdVsFltRt:  '10.15'
  // mkp:  '2457.04'
  // trPrc:  '10732465515437'
  // trqu:  '450481378'
  // vs:  '.73'
  // yrWRcrdHgst:  '2484.02'
  // yrWRcrdHgstDt:  '20230127'
  // yrWRcrdLwst:  '2218.68'
  // yrWRcrdLwstDt:  '20230103'
  static createByIndex(isuSrtCd: string, datagoIndex: any) {
    const { basDt, clpr, vs, fltRt, mkp, hipr, lopr, trqu, trPrc } = datagoIndex;
    return {
      isuSrtCd,
      baseDt: basDt,
      clpr,
      vs,
      fltRt,
      mkp,
      hipr,
      lopr,
      trqu,
      trPrc,
    } as StockDailyPrice;
  }

  // basDt:  '20230307'
  // clpr:  '4645'
  // fltRt:  '-5.2'
  // hipr:  '4875'
  // isinCd:  'KR7030210009'
  // itmsNm:  '다올투자증권'
  // lopr:  '4635'
  // lstgStCnt:  '60314092'
  // mkp:  '4850'
  // mrktCtg:  'KOSPI'
  // mrktTotAmt:  '280158957340'
  // srtnCd:  '030210'
  // trPrc:  '2106079465'
  // trqu:  '446935'
  // vs:  '-255'
  static createBy(isuSrtCd: string, datago: any) {
    const { basDt, mrktCtg, clpr, vs, fltRt, mkp, hipr, lopr, trqu, trPrc, lstgStCnt, mrktTotAmt } = datago;
    return {
      isuSrtCd,
      baseDt: basDt,
      mrktCtg,
      clpr,
      vs,
      fltRt,
      mkp,
      hipr,
      lopr,
      trqu,
      trPrc,
      lstgStCnt,
      mrktTotAmt,
    } as StockDailyPrice;
  }
}
