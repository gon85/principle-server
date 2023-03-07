import { ApiProperty } from '@nestjs/swagger';
import { AnalysisMarketpriceDto } from '@src/modules/analysis/dto/analysis-marketprice.dot';
import TradingMst from '../entities/trading-mst.entity';

export class TradingInfoDto extends TradingMst {
  @ApiProperty({
    description: '현재가',
  })
  currentPrice: number;

  @ApiProperty({
    description: '목표가',
  })
  targetPrice: number;

  @ApiProperty({
    description: '매수후 최고가',
  })
  topPrice: number;

  @ApiProperty({
    description: '최고가 대비 하락율',
  })
  declineRateToTop: number;

  @ApiProperty({
    description: '매수후 최저가',
  })
  bottomPrice: number;

  @ApiProperty({
    description: '최저가 대비 상승율',
  })
  increaseRateToBot: number;

  static createBy(tm: TradingMst, amd: AnalysisMarketpriceDto) {
    return {
      ...tm,
      ...amd,
    } as TradingInfoDto;
  }
}
