import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from '@src/commons/dto/error-response.dto';
import { JwtAuthGuard } from '@src/modules/auth/guards/jwt-auth.guard';
import UserAlarmDto from '../dto/user-alarm.dto';
import UserCreterionInfoDto from '../dto/user-creterion-info.dto';
import UserCreterionDto from '../dto/user-creterion.dto';
import { CreterionService } from '../services/creterion.service';

@Controller('creterions')
@ApiTags('creterions')
@ApiBearerAuth()
export class CreterionsController {
  constructor(private readonly creterionService: CreterionService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: `
      이용자 원칙 기준을 조회 합니다.
    `,
  })
  @ApiCreatedResponse({
    type: UserCreterionInfoDto,
    description: '이용자 원칙 기준',
  })
  getUserCreterion(@Request() req) {
    return this.creterionService.getUserCreterion(req.user.userId);
  }

  @Post('')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: `
      이용자 원칙 기준을 저장 합니다.
    `,
  })
  @ApiCreatedResponse({
    type: UserCreterionDto,
    description: '원칙 기준',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: '오류 객체',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  saveUserCreterion(@Request() req, @Body() ucd: UserCreterionDto) {
    return this.creterionService.saveUserCreterion(req.user.userId, ucd);
  }

  @Post('alarm')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: `
      이용자 알람을 저장 합니다.
    `,
  })
  @ApiCreatedResponse({
    type: UserAlarmDto,
    isArray: true,
    description: '알람정보',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: '오류 객체',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  saveUserArarm(@Request() req, @Body() uad: UserAlarmDto) {
    return this.creterionService.saveUserAlarms(req.user.userId, uad);
  }
}
