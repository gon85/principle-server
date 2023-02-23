export const transformerDecimal = {
  to(data: number): number {
    return data;
  },
  from(data: string): number {
    return Number(data);
  },
};

export const transformBoolean = ({ value }) => value === 'true' || value === true;
