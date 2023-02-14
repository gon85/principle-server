import datetimeUtils from '@src/commons/utils/datetime-utils';
import { Transform, TransformInstanceToPlain, Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Trading from './trading.entity';

const ttDesc = {
  id: 'primary key',
  tradingId: '매매 master',
  isuSrtCd: 'KRX 종목코드(short)',
  tradingTypeCd: '매매종류(매수, 매도 : B, S)',
  tradingDate: 'YYYY-MM-DD',
  tradingTime: 'HH:mm:ss',
  price: '가격',
  cnt: '수량',
  tradingAt: '거래시간',
  createdAt: '생성일',
};

@Entity()
export default class TradingTrx {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    unsigned: true,
    comment: ttDesc.id,
  })
  @IsOptional()
  id!: number;

  @Column({ type: 'int', unsigned: true, comment: ttDesc.tradingId })
  @IsOptional()
  tradingId!: number;

  @Column({ type: 'varchar', length: 12, comment: ttDesc.isuSrtCd })
  @IsString()
  isuSrtCd!: string;

  @Column({ type: 'varchar', length: 2, comment: ttDesc.tradingTypeCd })
  @IsString()
  tradingTypeCd!: string;

  @Column({ type: 'varchar', length: 10, comment: ttDesc.tradingDate })
  @IsString()
  tradingDate!: string;

  @Column({ type: 'varchar', length: 8, comment: ttDesc.tradingTime })
  @IsString()
  tradingTime!: string;

  @Column({ type: 'int', comment: ttDesc.price })
  @IsNumber()
  price!: number;

  @Column({ type: 'int', comment: ttDesc.cnt })
  @IsNumber()
  cnt!: number;

  @Column({ type: 'datetime', comment: ttDesc.createdAt })
  @IsDate()
  @Transform(({ value }) => {
    return datetimeUtils.getDayjs(value).toDate();
  })
  tradingAt!: Date;

  @CreateDateColumn({
    type: 'datetime',
    comment: ttDesc.createdAt,
    // transformer: {
    //   to(data: Date): Date {
    //     return data;
    //   },
    //   from(data: Date): Date {
    //     return datetimeUtils.getDayjs(data).utc().toDate();
    //   },
    // },
  })
  @Transform(({ value }) => {
    return datetimeUtils.getDayjs(value).format();
  })
  createdAt!: Date;

  // @BeforeInsert()
  // updateDates() {
  //   this.createdDate = new Date();
  // }

  @ManyToOne(() => Trading, (t) => t.tradingTrxes)
  @JoinColumn({ name: 'trading_id', referencedColumnName: 'id' })
  trading!: Trading;
}
