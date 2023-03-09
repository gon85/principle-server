import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DefaultResponseDto } from '@src/commons/dto/default-response.dto';
import { JwtAuthGuard } from '@src/modules/auth/guards/jwt-auth.guard';
import { CrawlingOptionsDto } from '../dto/crawling-options.dto';
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

  @Post('crawling/daily/:isuSrtCd')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: `
      주가 시세정보를 가져옵니다.
    `,
  })
  @ApiCreatedResponse({
    type: DefaultResponseDto,
  })
  crawlingPrice(@Request() req, @Param('isuSrtCd') isuSrtCd: string, @Body() options: CrawlingOptionsDto) {
    return this.stockService.crawlingDailyPriceByCorp(isuSrtCd, options);
  }
}
