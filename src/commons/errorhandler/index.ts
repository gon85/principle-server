import { BadRequestException, HttpException } from '@nestjs/common';

interface ErrorCode {
  code: string;
  message: string;
}

export const ErrorCodes = {
  NOT_FOUND: { code: 'common-0001', message: '정보를 찾을 수 없습니다.' },
  NOT_FOUND_USER: { code: 'user-0001', message: '이용자 정보를 찾을 수 없습니다.' },
  NOT_FOUND_TRADING: { code: 'trading-0001', message: '매매내역을 찾을 수 없습니다.' },
  NOT_FOUND_STOCK: { code: 'stock-0001', message: '시세정보를 찾을 수 없습니다.' },
} as const;
// export type ErrorCodes = keyof typeof ErrorInfos;

export const ErrorHandler = {
  get(code: ErrorCode, data?: any): HttpException {
    return new BadRequestException({
      code: code.code,
      data,
      message: code.message,
    });
  },
  checkThrow(cond: boolean, code: ErrorCode, obj?: any) {
    if (!cond) return;
    throw ErrorHandler.get(code, obj);
  },
};
