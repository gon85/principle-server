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
    description: '고점,저점 대비 결과',
  })
  marketPrice: AnalysisMarketpriceDto;

  @ApiProperty({
    description: '매도이유',
  })
  sellReasons: string[];

  static buildSellReason(ashd: AnalysisStockHeldDto) {
    const sellReasons: string[] = [];
    if (ashd.profit) {
      if (ashd.profit.profit >= ashd.profit.targetProfitRatio) {
        sellReasons.push('목표 수익율 달성');
      }
      if (ashd.profit.profit < ashd.profit.maxLossRatio) {
        sellReasons.push('감내 손실율 초과');
      }
    }
    if (ashd.period) {
      if (ashd.period.exceedDate > 0) {
        sellReasons.push('투자기간 초과');
      }
    }
    if (ashd.marketPrice) {
      if (ashd.marketPrice.declineRateToTop < -5) {
        sellReasons.push('고점대비 하락율');
      }
    }
    return sellReasons;
  }
}
