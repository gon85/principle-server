import { ApiProperty } from '@nestjs/swagger';
import { DefaultResponseDto } from './default-response.dto';

export class ErrorResponseDto extends DefaultResponseDto {
  // @ApiProperty({ description: '에러코드' })
  // code!: string;

  // @ApiProperty({ description: '에러 메세지' })
  // message!: string;

  @ApiProperty({ description: '에러 payload' })
  data?: any;
}
