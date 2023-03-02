import { ApiProperty } from '@nestjs/swagger';

export class AnalysisPeriodDto {
  @ApiProperty({
    description: '목표 투자기간',
  })
  investmentPeriod: number;

  @ApiProperty({
    description: '실제 투자기간',
  })
  durationTime: number;

  @ApiProperty({
    description: '투자기간 단윈(M:월, W:주)',
  })
  timeUint: 'W' | 'M';

  @ApiProperty({
    description: '초과 기간',
  })
  exceedTime: number;

  @ApiProperty({
    description: '초과한 일수',
  })
  exceedDate: number;

  @ApiProperty({
    description: '마지막 투자 일',
  })
  lastTradingAt: Date;

  @ApiProperty({
    description: '종합평가',
  })
  sentences: string[];

  static createBy({
    investmentPeriod,
    durationTime,
    exceedTime,
    exceedDate,
    timeUint,
    lastTradingAt,
  }: Partial<AnalysisPeriodDto>) {
    const sentences = [];
    const diffUnitName = timeUint === 'M' ? '개월' : '주차';

    sentences.push(`총 투자 기간이 ${durationTime}${diffUnitName}입니다.`);
    if (exceedTime > 0) {
      sentences.push(
        `목표투자기간(${investmentPeriod}${diffUnitName})을 ${exceedDate}일 **초과**했습니다. **정리**가 필요합니다.`,
      );
      sentences.push(`마지막 거래일: ${lastTradingAt}`);
    }

    return {
      investmentPeriod,
      durationTime,
      timeUint,
      exceedTime: exceedTime > 0 ? exceedTime : 0,
      exceedDate,
      lastTradingAt,
      sentences,
    } as AnalysisPeriodDto;
  }
}
