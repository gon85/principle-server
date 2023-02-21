const StockContants = {
  IndexCode: {
    KOSPI: 'KOSPI',
    KOSDAQ: 'KOSDAQ',
    IsIndexCode(code: string) {
      return this.KOSPI === code || this.KOSDAQ === code;
    },
  },
  DEFAULT_MOVEAVG_UNITS: [5, 10, 20],
};

export default StockContants;
