import { PartialType } from '@nestjs/swagger';
import TradingTrx from '../entities/trading-trx.entity';

export class TradingTrxDto extends PartialType<TradingTrx>(TradingTrx) {}
