import { ApiProperty } from '@nestjs/swagger';

export class AnalysisMarketpriceDto {
  @ApiProperty({
    description: '현재가',
  })
  currentPrice: number;

  @ApiProperty({
    description: '목표가',
  })
  targetPrice: number;

  @ApiProperty({
    description: '매수평균가',
  })
  buyPriceAvg: number;

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
}
