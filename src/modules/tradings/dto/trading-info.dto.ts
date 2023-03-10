import { ApiProperty } from '@nestjs/swagger';
import { AnalysisMarketpriceDto } from '@src/modules/analysis/dto/analysis-marketprice.dto';
import { AnalysisStockHeldDto } from '@src/modules/analysis/dto/analysis-stock-held.dto';
import TradingMst from '../entities/trading-mst.entity';

export class TradingInfoDto extends TradingMst {
  @ApiProperty({
    description: '보유 종목 분석 결과',
  })
  analyseResult: AnalysisStockHeldDto;

  static createBy(tm: TradingMst, ashd: AnalysisStockHeldDto) {
    return {
      ...tm,
      analyseResult: ashd,
    } as TradingInfoDto;
  }
}
