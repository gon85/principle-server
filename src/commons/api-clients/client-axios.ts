import axios, { AxiosInstance } from 'axios';
import constUri from '../constants/const-uri';

export const krxAxios = axios.create({
  baseURL: constUri.krx.base,
  withCredentials: true,
});

export const dartAxios = axios.create({
  baseURL: constUri.dart.base,
  withCredentials: true,
});

export const naverAxios = axios.create({
  baseURL: constUri.naver.base,
  withCredentials: true,
});

export const datagoAxios = axios.create({
  baseURL: constUri.datago.base,
  withCredentials: true,
});

class ClientAxios {
  krxAxios: AxiosInstance;
  dartAxios: AxiosInstance;
  naverAxios: AxiosInstance;
  datagoAxios: AxiosInstance;
  constructor() {
    this.krxAxios = krxAxios;
    this.dartAxios = dartAxios;
    this.naverAxios = naverAxios;
    this.datagoAxios = datagoAxios;
  }

  async getStockAllCode() {
    const repKrx = await clientAxios.krxAxios.post(constUri.krx.stockCode.uri, constUri.krx.stockCode.params());
    return repKrx.data;
  }

  async getETFAllCode() {
    const repKrx = await clientAxios.krxAxios.post(constUri.krx.etfCode.uri, constUri.krx.etfCode.params());
    return repKrx.data;
  }

  /**
   * @deprecated getStockPriceInNaver 대체
   */
  async getStockPriceDailyInKrx(isuCd: string, fromdate: string, todate: string) {
    const repDaily = await this.krxAxios.post(
      constUri.krx.stockPriceDaily.uri,
      constUri.krx.stockPriceDaily.params(isuCd, fromdate, todate),
    );

    return repDaily.data;
  }

  async getStockPriceInNaver(isuCd: string, fromdate: string, todate: string, timeframe: 'week' | 'day' = 'week') {
    const rep = await this.naverAxios.post(
      constUri.naver.stockPrice.uri,
      constUri.naver.stockPrice.params(isuCd, fromdate, todate, timeframe),
    );

    // eslint-disable-next-line no-useless-escape
    const replaceJsonString = rep.data.replace(/\'/g, '"');
    // end date 포함 안되도록 처리 (end date 포함여부 확인 필요)
    const array = JSON.parse(replaceJsonString);
    array.splice(0, 1);
    if (array.length > 0 && array[array.length - 1][0] === todate) {
      array.pop();
    }
    return array;
  }

  async getStockPriceWeekly(isuCd: string, fromdate: string, todate: string) {
    const repWeekly = await this.naverAxios.post(
      constUri.naver.stockPrice.uri,
      constUri.naver.stockPrice.params(isuCd, fromdate, todate),
    );

    // eslint-disable-next-line no-useless-escape
    const replaceJsonString = repWeekly.data.replace(/\'/g, '"');
    return JSON.parse(replaceJsonString);
  }

  /**
   *
   * @param isuCd
   * @param fromdate
   * @param todate 미포함됨.
   * @param kindStkcertTpNm
   * @returns
   */
  async getStockPriceInDatago(isuCd: string, fromdate: string, todate: string, kindStkcertTpNm = '보통주') {
    if (kindStkcertTpNm === 'ETF') {
      const repSDP = await this.datagoAxios.get(constUri.datago.etfStockPrice.uri, {
        params: constUri.datago.etfStockPrice.query({ likeSrtnCd: isuCd, beginBasDt: fromdate, endBasDt: todate }),
      });
      return repSDP.data;
    } else if (kindStkcertTpNm === 'INDEX') {
      const repSDP = await this.datagoAxios.get(constUri.datago.indexStockPrice.uri, {
        params: constUri.datago.indexStockPrice.query({ idxNm: isuCd, beginBasDt: fromdate, endBasDt: todate }),
      });
      return repSDP.data;
    } else {
      const repSDP = await this.datagoAxios.get(constUri.datago.stockPrice.uri, {
        params: constUri.datago.stockPrice.query({ likeSrtnCd: isuCd, beginBasDt: fromdate, endBasDt: todate }),
      });
      return repSDP.data;
    }
  }
  async getStockPriceInDatagoByDate(baseDt: string) {
    const repSDP = await this.datagoAxios.get(constUri.datago.stockPrice.uri, {
      params: constUri.datago.stockPrice.query({ basDt: baseDt, numOfRows: 5000 }),
    });
    return repSDP.data;
  }
}

const clientAxios = new ClientAxios();
export default clientAxios;
