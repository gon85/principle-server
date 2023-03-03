import { ApiProperty } from '@nestjs/swagger';
import TradingMst from '@src/modules/tradings/entities/trading-mst.entity';

export class AnalysisProfitDto {
  @ApiProperty({
    description: '목표 수익율',
  })
  targetProfitRatio: number;

  @ApiProperty({
    description: '감내 손실율',
  })
  maxLossRatio: number;

  @ApiProperty({
    description: '현재가',
  })
  currentPrice: number;

  @ApiProperty({
    description: '매수평균가',
  })
  avgBuyPrice: number;

  @ApiProperty({
    description: '매수금합계',
  })
  sumBuyPrice: number;

  @ApiProperty({
    description: '매수량합계',
  })
  sumBuyCnt!: number;

  @ApiProperty({
    description: '매도금합계',
  })
  sumSellPrice: number;

  @ApiProperty({
    description: '매도량합계',
  })
  sumSellCnt!: number;

  @ApiProperty({
    description: '매도평균가',
  })
  avgSellPrice: number;

  @ApiProperty({
    description: '보유수량',
  })
  remainCount: number;

  @ApiProperty({
    description: '현재수익율',
  })
  profit: number;

  @ApiProperty({
    description: '종합평가',
  })
  sentences: string[];

  static createBy(
    targetProfitRatio: number,
    maxLossRatio: number,
    currentPrice: number,
    tmTarget: TradingMst,
    isExceedPeroid: boolean,
  ) {
    const profit = ((currentPrice - tmTarget.buyPriceAvg) * 100) / tmTarget.buyPriceAvg;
    const sentences =
      profit >= 0
        ? AnalysisProfitDto.createProfitSentencesBy(targetProfitRatio, profit, isExceedPeroid)
        : AnalysisProfitDto.createLossSentenseBy(maxLossRatio, profit, isExceedPeroid);

    return {
      targetProfitRatio,
      maxLossRatio,
      currentPrice,
      sumBuyPrice: 0,
      sumBuyCnt: tmTarget.buyCntSum || 0,
      avgBuyPrice: tmTarget.buyPriceAvg || 0,
      sumSellPrice: 0,
      sumSellCnt: tmTarget.sellCntSum || 0,
      avgSellPrice: tmTarget.sellPriceAvg || 0,
      remainCount: tmTarget.remainCount || 0,
      profit,
      sentences,
    } as AnalysisProfitDto;
  }

  static createProfitSentencesBy(targetProfitRatio: number, profit: number, isExceedPeroid: boolean) {
    const sentences = [];
    sentences.push(`목표수익율: ${targetProfitRatio}`);
    if (targetProfitRatio <= profit) {
      sentences.push('**목표수익율 달성**했습니다. (수익확정해보세요.)');
      if (isExceedPeroid === false) {
        sentences.push('(**조기**달성했습니다!!!)');
      }
    } else {
      sentences.push(`**${profit}% 수익** 달성 중 입니다.`);
    }

    return sentences;
  }

  static createLossSentenseBy(maxLossRatio: number, profit: number, isExceedPeroid: boolean) {
    const sentences = [];
    sentences.push(`감내 손실율: ${maxLossRatio}`);
    if (maxLossRatio > profit) {
      sentences.push('**감내 손실율을 벗어**났습니다.(**정리**가 필요합니다.)');
      if (isExceedPeroid === false) {
        sentences.push('(아직 투자기간은 유효합니다.)');
      }
    } else {
      sentences.push(`**${profit}% 손실** 중 입니다.`);
    }
    return sentences;
  }
}
