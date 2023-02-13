import { ApiProperty } from '@nestjs/swagger';
import PageInfoDto from '@src/commons/dto/page-info.dto';
import Trading from '../entities/trading.entity';

export class TradingInfoDto {
  @ApiProperty({
    description: '주문번호 (userIdx)',
    isArray: true,
  })
  list!: Trading[];

  @ApiProperty({
    description: '이용자 브라사이즈',
  })
  pageInfo!: PageInfoDto;
}
