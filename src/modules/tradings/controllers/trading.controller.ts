import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/commons/dto/error-response.dto';
import { JwtAuthGuard } from '@src/modules/auth/guards/jwt-auth.guard';
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
  @UseGuards(JwtAuthGuard)
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
  @UseInterceptors(ClassSerializerInterceptor)
  addTradingTrx(@Request() req, @Body() ttDto: TradingTrxDto) {
    return this.tradingService.addTradingTrx(req.user.userId, ttDto);
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: `
      매매를 조회 합니다.
    `,
  })
  @ApiCreatedResponse({
    type: TradingInfoDto,
    description: '매매 정보',
  })
  getTradings(@Request() req) {
    return this.tradingService.getTradingInfo(req.user.userId);
  }
}
