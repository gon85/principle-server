import { PartialType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import TradingTrx from '../entities/trading-trx.entity';

export class TradingTrxDto extends PartialType<TradingTrx>(TradingTrx) {
  @IsString()
  isuSrtCd: string;
}
