import { ApiProperty } from '@nestjs/swagger';
import Corparation from '@src/modules/corparation/entities/corparation.entity';
import { AnalysisMarketpriceDto } from './analysis-marketprice.dto';
import { AnalysisPeriodDto } from './analysis-period.dto';
import { AnalysisProfitDto } from './analysis-profit.dto';

/**
 * 보유종목 분석
 */
export class AnalysisStockHeldDto {
  @ApiProperty({
    description: 'corp key',
  })
  isuSrtCd: string;

  @ApiProperty({
    description: 'corp key',
  })
  corp: Corparation;

  @ApiProperty({
    description: '투자 기간 분석 결과',
  })
  period: AnalysisPeriodDto;

  @ApiProperty({
    description: '수익율 분석 결과',
  })
  profit: AnalysisProfitDto;

  @ApiProperty({
    description: '수익율 분석 결과',
  })
  marketPrice: AnalysisMarketpriceDto;
}
