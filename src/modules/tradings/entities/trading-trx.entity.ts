import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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
  id!: number;

  @Column({ type: 'int', unsigned: true, comment: ttDesc.tradingId })
  tradingId!: number;

  @Column({ type: 'varchar', length: 12, comment: ttDesc.isuSrtCd })
  isuSrtCd!: string;

  @Column({ type: 'varchar', length: 2, comment: ttDesc.tradingTypeCd })
  tradingTypeCd!: string;

  @Column({ type: 'varchar', length: 10, comment: ttDesc.tradingDate })
  tradingDate!: string;

  @Column({ type: 'varchar', length: 8, comment: ttDesc.tradingTime })
  tradingTime!: string;

  @Column({ type: 'int', comment: ttDesc.price })
  price!: number;

  @Column({ type: 'int', comment: ttDesc.cnt })
  cnt!: number;

  @Column({ type: 'datetime', comment: ttDesc.createdAt })
  tradingAt!: Date;

  @CreateDateColumn({ type: 'datetime', comment: ttDesc.createdAt })
  createdAt!: Date;

  @ManyToOne(() => Trading, (t) => t.tradingTrxes)
  @JoinColumn({ name: 'trading_id', referencedColumnName: 'id' })
  trading!: Trading;
}
