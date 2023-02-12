import * as querystring from 'querystring';

const dart = {
  APIKEY: '198b87abcaec09c3b78dc0076b6140effd327a99',
  // base: 'https://opendart.fss.or.kr/api',
};
// const krx = {
//   base: 'http://marketdata.krx.co.kr',
// };

const constUri = {
  dart: {
    base: 'https://opendart.fss.or.kr/api',
    corpCode: `/corpCode.xml?crtfc_key=${dart.APIKEY}`,
  },
  naver: {
    base: 'https://fchart.stock.naver.com',
    stockPrice: {
      uri: '/siseJson.nhn',
      params(symbol: string, startTime: string, endTime: string, timeframe = 'week') {
        const formdata = {
          symbol,
          startTime,
          endTime,
          requestType: 1,
          timeframe,
        };
        return querystring.stringify(formdata);
      },
    },
  },
  krx: {
    base: 'http://data.krx.co.kr',
    stockCode: {
      uri: '/comm/bldAttendant/getJsonData.cmd',
      params() {
        const formdata = {
          bld: 'dbms/MDC/STAT/standard/MDCSTAT01901',
          locale: 'ko_KR',
          mktId: 'ALL',
          share: 1,
          csvxls_isNo: false,
        };
        return querystring.stringify(formdata);
      },
    },
    etfCode: {
      uri: '/comm/bldAttendant/getJsonData.cmd',
      params() {
        const formdata = {
          bld: 'dbms/MDC/STAT/standard/MDCSTAT04601',
          locale: 'ko_KR',
          share: 1,
          csvxls_isNo: false,
        };
        return querystring.stringify(formdata);
      },
    },
    stockPriceDaily: {
      uri: '/comm/bldAttendant/getJsonData.cmd',
      params(isuCd: string, fromdate: string, todate: string) {
        const formdata = {
          bld: 'dbms/MDC/STAT/standard/MDCSTAT01701',
          // tboxisuCd_finder_stkisu0_6: '030210/KTB투자증권',
          isuCd,
          isuCd2: isuCd,
          // codeNmisuCd_finder_stkisu0_6: 'KTB투자증권',
          // param1isuCd_finder_stkisu0_6: 'STK',
          strtDd: fromdate,
          endDd: todate,
          share: 1,
          money: 1,
          csvxls_isNo: false,
        };
        return querystring.stringify(formdata);
      },
    },
  },
  krxOld: {
    base: 'http://marketdata.krx.co.kr',
    generateOPT: {
      uri: '/contents/COM/GenerateOTP.jspx',
      params(p: { bld: string; name: string }) {
        return {
          bld: p.bld,
          name: p.name,
          _: new Date().getTime(),
        };
      },
    },
    stockCode: {
      uri: '/contents/MKD/99/MKD99000001.jspx',
      paramsOPT: {
        bld: 'COM/finder_stkisu',
        name: 'form',
      },
      params(code: string, no = 'P1', mktsel = 'ALL', searchText = '', pageFirstCall = 'Y') {
        const formdata = {
          code,
          no,
          mktsel,
          searchText,
          pageFirstCall,
        };
        return querystring.stringify(formdata);
      },
    },
    stockPriceDaily: {
      uri: '/contents/MKD/99/MKD99000001.jspx',
      paramsOPT: {
        bld: 'MKD/04/0402/04020100/mkd04020100t3_02',
        name: 'chart',
      },
      params(
        code: string,
        isuSrtCd: string,
        isuCd: string,
        fromdate: string, //YYYYMMDD
        todate: string,
        isucdnm = '',
        isuNm = '',
        pagePath = '/contents/MKD/04/0402/04020100/MKD04020100T3T2.jsp',
      ) {
        const formdata = {
          isu_cdnm: isucdnm,
          isu_cd: isuCd,
          isu_nm: isuNm,
          isu_srt_cd: isuSrtCd,
          fromdate: fromdate,
          todate: todate,
          pagePath,
          code,
        };
        return querystring.stringify(formdata);
      },
    },
    stockPriceToday: {
      uri: '/contents/MKD/99/MKD99000001.jspx',
      paramsOPT: {
        bld: 'MKD/04/0402/04020100/mkd04020100t2_01',
        name: 'tablesubmit',
      },
      params(
        code: string,
        isuSrtCd: string,
        isuCd: string,
        fromdate: string, //YYYYMMDD
        todate: string,
        isucdnm = '',
        isuNm = '',
        pagePath = '/contents/MKD/04/0402/04020100/MKD04020100T3T2.jsp',
        bldcode = 'MKD/04/0402/04020100/mkd04020100t2_01',
      ) {
        const formdata = {
          isu_cdnm: isucdnm,
          isu_cd: isuCd,
          isu_nm: isuNm,
          isu_srt_cd: isuSrtCd,
          fromdate: fromdate,
          todate: todate,
          pagePath,
          bldcode,
          code,
        };
        return querystring.stringify(formdata);
      },
    },
  },
};

export default constUri;
