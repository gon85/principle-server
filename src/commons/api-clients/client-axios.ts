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

class ClientAxios {
  krxAxios: AxiosInstance;
  dartAxios: AxiosInstance;
  naverAxios: AxiosInstance;
  constructor() {
    this.krxAxios = krxAxios;
    this.dartAxios = dartAxios;
    this.naverAxios = naverAxios;
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
    if (array[array.length - 1][0] === todate) {
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
}

const clientAxios = new ClientAxios();
export default clientAxios;
