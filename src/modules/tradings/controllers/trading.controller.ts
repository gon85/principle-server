import { Controller, Post, Body, UseGuards, Req, Put, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ErrorResponseDto } from '@src/commons/dto/error-response.dto';
import { TradingInfoDto } from '../dto/trading-info.dto';
import { TradingTrxDto } from '../dto/trading-trx.dto';
import { TradingService } from '../services/trading.service';
// import { UserGuard } from '@src/modules/users/guard/user.guard';

@Controller('tradings')
@ApiTags('tradings')
@ApiBearerAuth()
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @Post('')
  // @UseGuards(UserGuard)
  @ApiOperation({
    description: `
      매매를 저장 합니다.
    `,
  })
  @ApiCreatedResponse({
    type: TradingInfoDto,
    description: '매매 정보',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: '오류 객체',
  })
  addTradingTrx(@Req() req: Request, @Body() ttDto: TradingTrxDto) {
    // return this.tradingService.addTradingTrx(<number>req.userIdx, ttDto);
    return '';
  }
}
