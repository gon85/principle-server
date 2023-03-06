import { ApiProperty } from '@nestjs/swagger';
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
    description: '투자 기간 분석 결과',
  })
  period: AnalysisPeriodDto;

  @ApiProperty({
    description: '수익율 분석 결과',
  })
  profit: AnalysisProfitDto;
}
