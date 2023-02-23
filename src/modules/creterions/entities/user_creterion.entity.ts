import { transformerDecimal } from '@src/commons/utils/transformer-utils';
import User from '@src/modules/user/entities/user.entity';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';

const desc = {
  userId: 'user key',

  targetProfitRatio: '목표 수익율',
  maxLossRatio: '감내 손실율',
  investmentPeriod: '목표 투자기간(month)',
  investmentPeriodUnit: '목표 투자기간 단위(W, M)',

  maxHoldCorpCnt: '최대보유 주식종목 수',
  maxBuyingAmount: '한 종목 최대매수금액',

  alarmAnalysisTime: '분석시간',
  maxFocusInterestCnt: '최대 관심 종목 수',
};

@Entity('user_creterion')
export default class UserCreterion {
  @PrimaryColumn({
    type: 'int',
    unsigned: true,
    comment: desc.userId,
  })
  @IsOptional()
  userId: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: desc.targetProfitRatio,
    transformer: transformerDecimal,
  })
  @IsNumber()
  targetProfitRatio: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: desc.maxLossRatio,
    transformer: transformerDecimal,
  })
  @IsNumber()
  maxLossRatio: number;

  @Column({
    type: 'int',
    default: 0,
    comment: desc.investmentPeriod,
  })
  @IsNumber()
  investmentPeriod: number;

  @Column({
    type: 'varchar',
    length: 1,
    default: 'M',
    comment: desc.investmentPeriodUnit,
  })
  @IsString()
  investmentPeriodUnit: 'W' | 'M';

  @Column({
    type: 'int',
    unsigned: true,
    default: 0,
    comment: desc.maxHoldCorpCnt,
  })
  @IsNumber()
  maxHoldCorpCnt: number;

  @Column({
    type: 'int',
    unsigned: true,
    default: 0,
    comment: desc.maxBuyingAmount,
  })
  @IsNumber()
  maxBuyingAmount: number;

  @Column({
    type: 'int',
    unsigned: true,
    default: 0,
    comment: desc.maxFocusInterestCnt,
  })
  @IsNumber()
  maxFocusInterestCnt: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (u) => u.creterion)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user?: User;
}
