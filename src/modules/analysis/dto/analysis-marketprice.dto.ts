import { ApiProperty } from '@nestjs/swagger';
import mathUtils from '@src/commons/utils/math-utils';

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

  static createBy(
    currentPrice: number,
    targetPrice: number,
    buyPriceAvg: number,
    topPrice: number,
    bottomPrice: number,
  ) {
    return {
      currentPrice,
      targetPrice,
      buyPriceAvg,
      topPrice,
      bottomPrice,
      declineRateToTop: mathUtils.rate(topPrice, currentPrice),
      increaseRateToBot: mathUtils.rate(bottomPrice, currentPrice),
    } as AnalysisMarketpriceDto;
  }
}
