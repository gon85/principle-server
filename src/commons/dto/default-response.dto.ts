import { ApiProperty } from '@nestjs/swagger';

type Result = 'OK' | 'FAIL';
export class DefaultResponseDto {
  @ApiProperty({ description: '정상처리여부' })
  result: Result = 'OK';

  @ApiProperty({ description: '코드' })
  code!: string;

  @ApiProperty({ description: '메세지' })
  message!: string;

  static create(result: Result, message?: string) {
    return {
      result,
      message,
    } as DefaultResponseDto;
  }

  static createSuccess(message?: string) {
    return {
      result: 'OK',
      message,
    } as DefaultResponseDto;
  }

  static createFail(message?: string) {
    return {
      result: 'FAIL',
      message,
    } as DefaultResponseDto;
  }
}
