import { ApiProperty } from '@nestjs/swagger';
import Corparation from '@src/modules/corparation/entities/corparation.entity';

export class AnalysisRebuyDto {
  @ApiProperty({
    description: '재 매수 대상 종목',
  })
  rebuyStockInfos: RebuyStockInfo[];

  static createBy(rsis: RebuyStockInfo[]) {
    return {
      rebuyStockInfos: rsis,
    } as AnalysisRebuyDto;
  }
}

/**
 * 재 매수 종목 정보 (내가 판 가격에 다시 사기.)
 */
export class RebuyStockInfo {
  // @ApiProperty({
  //   description: '종목',
  // })
  // corp: Corparation;

  @ApiProperty({
    description: '종목코드',
  })
  isuSrtCd: string;

  @ApiProperty({
    description: '종목명',
  })
  isuAbbrv: string;

  @ApiProperty({
    description: '현재가',
  })
  currentPrice: number;

  @ApiProperty({
    description: '이전 매도가',
  })
  beforeSellPrice: number;

  @ApiProperty({
    description: '이전 수익율',
  })
  beforeProfitRate: number;

  @ApiProperty({
    description: '이전 마지막 거래일',
  })
  lastTradingAt: Date;
}
