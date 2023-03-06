import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/commons/dto/error-response.dto';
import { JwtAuthGuard } from '@src/modules/auth/guards/jwt-auth.guard';
import { TradingListDto } from '../dto/trading-list.dto';
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
    type: TradingListDto,
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

  @Put('')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: `
      매매를 수정 합니다.
    `,
  })
  @ApiCreatedResponse({
    type: TradingListDto,
    description: '매매 정보',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: '오류 객체',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  putTradingTrx(@Request() req, @Body() ttDto: TradingTrxDto) {
    return this.tradingService.modifyTradingByTrx(req.user.userId, ttDto);
  }

  @Delete(':isuSrtCd/:ttId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: `
      매매를 삭제 합니다.
    `,
  })
  @ApiCreatedResponse({
    type: TradingListDto,
    description: '매매 정보',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: '오류 객체',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  delTradingTrx(@Request() req, @Param('isuSrtCd') isuSrtCd: string, @Param('ttId') ttId: number) {
    return this.tradingService.removeTradingByTrx(req.user.userId, isuSrtCd, ttId);
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: `
      매매를 조회 합니다.
    `,
  })
  @ApiOkResponse({
    type: TradingListDto,
    description: '매매 정보',
  })
  getTradings(@Request() req) {
    return this.tradingService.getTradingInfo(req.user.userId);
  }
}
