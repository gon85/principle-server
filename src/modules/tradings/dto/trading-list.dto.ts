import { ApiProperty } from '@nestjs/swagger';
import PageInfoDto from '@src/commons/dto/page-info.dto';
import TradingMst from '../entities/trading-mst.entity';

export class TradingListDto {
  @ApiProperty({
    description: '주문번호 (userIdx)',
    isArray: true,
  })
  list!: TradingMst[];

  @ApiProperty({
    description: '이용자 브라사이즈',
  })
  pageInfo!: PageInfoDto;
}
