const mathUtils = {
  rate(orgVal: number, tarVal: number) {
    const r = ((tarVal - orgVal) * 100) / orgVal;
    return Number(r.toFixed(2));
  },
};

export default mathUtils;
