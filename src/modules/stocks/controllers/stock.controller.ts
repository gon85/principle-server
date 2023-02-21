import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/modules/auth/guards/jwt-auth.guard';
import { StockPriceInfoDto } from '../dto/stock-price-info.dto';
import { StockService } from '../services/stock.service';

@Controller('stocks')
@ApiTags('stocks')
@ApiBearerAuth()
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('daily')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: `
      주가를 조회 합니다.
    `,
  })
  @ApiCreatedResponse({
    type: StockPriceInfoDto,
    description: '주가 정보',
  })
  getStockDailyPrice(
    @Request() req,
    @Query('isuSrtCd') isuSrtCd: string,
    @Query('isuCd') isuCd: string,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
  ) {
    return this.stockService.getStockDailyPrice(isuSrtCd, isuCd, fromDate, toDate, req.user.userId);
  }
}
