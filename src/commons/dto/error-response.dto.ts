import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ description: '에러코드' })
  code!: string;

  @ApiProperty({ description: '에러 메세지' })
  message!: string;

  @ApiProperty({ description: '에러 payload' })
  data?: any;
}
