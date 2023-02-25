import datetimeUtils from '@src/commons/utils/datetime-utils';
import { TradingTrxDto } from '@src/modules/tradings/dto/trading-trx.dto';

export const fakeDataHelper = {
  fakeTradingInputData(isuSrtCd: string): TradingTrxDto[] {
    const ts = [
      { isuSrtCd, tradingDate: '2020-11-02', tradingTime: '13:01:01', tradingTypeCd: 'B', price: 1000, cnt: 10 }, // 0
      { isuSrtCd, tradingDate: '2020-11-03', tradingTime: '13:01:01', tradingTypeCd: 'S', price: 1000, cnt: 10 }, // 1 거래완료
      { isuSrtCd, tradingDate: '2020-11-04', tradingTime: '13:01:01', tradingTypeCd: 'B', price: 1000, cnt: 10 }, // 2
      { isuSrtCd, tradingDate: '2020-11-05', tradingTime: '13:01:01', tradingTypeCd: 'B', price: 1000, cnt: 10 }, // 3
      { isuSrtCd, tradingDate: '2020-11-06', tradingTime: '13:01:01', tradingTypeCd: 'S', price: 1000, cnt: 20 }, // 4 거래완료
      { isuSrtCd, tradingDate: '2020-11-09', tradingTime: '13:01:01', tradingTypeCd: 'B', price: 1000, cnt: 10 }, // 5
      { isuSrtCd, tradingDate: '2020-11-11', tradingTime: '13:01:01', tradingTypeCd: 'B', price: 2000, cnt: 10 }, // 6
      { isuSrtCd, tradingDate: '2020-11-16', tradingTime: '13:01:01', tradingTypeCd: 'S', price: 2000, cnt: 20 }, // 7 거래완료
      { isuSrtCd, tradingDate: '2020-11-23', tradingTime: '13:01:01', tradingTypeCd: 'B', price: 1000, cnt: 10 }, // 8
      { isuSrtCd, tradingDate: '2020-11-25', tradingTime: '13:01:01', tradingTypeCd: 'S', price: 1000, cnt: 10 }, // 9 거래완료
    ];

    return ts.map(
      (t) =>
        ({
          ...t,
          tradingAt: datetimeUtils.toUtcDate(t.tradingDate + ' ' + t.tradingTime, 'YYYY-MM-DD HH:mm:ss'),
        } as TradingTrxDto),
    );
  },
};
