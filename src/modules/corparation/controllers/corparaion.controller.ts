import { Controller, UseGuards, Request, Get, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/commons/dto/error-response.dto';
import { JwtAuthGuard } from '@src/modules/auth/guards/jwt-auth.guard';
import { CorparationService } from '../services/corparation.service';

@Controller('corps')
@ApiTags('corps')
@ApiBearerAuth()
export class CorparationController {
  constructor(private readonly corpsService: CorparationService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: `
      회사를 조회 합니다.
    `,
  })
  // @ApiCreatedResponse({
  //   type: TradingInfoDto,
  //   description: '매매 정보',
  // })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: '오류 객체',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async addTradingTrx() {
    return this.corpsService.getCorps();
  }
}
