import { ApiProperty } from '@nestjs/swagger';
import { AnalysisPeriodDto } from './analysis-period.dto';

export class AnalysisResultDto {
  @ApiProperty({
    description: 'corp key',
  })
  isuSrtCd: string;

  @ApiProperty({
    description: '투자 기간 분석 결과',
  })
  period: AnalysisPeriodDto;
}
