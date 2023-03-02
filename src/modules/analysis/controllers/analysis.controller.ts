import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/modules/auth/guards/jwt-auth.guard';
import { AnalysisResultDto } from '../dto/analysis-corp-stock.dto';
import { AnalysisService } from '../services/analysis.service';

@Controller('analysis')
@ApiTags('analysis')
@ApiBearerAuth()
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get(':isuSrtCd')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: `
      이용자 원칙 기준을 조회 합니다.
    `,
  })
  @ApiCreatedResponse({
    type: AnalysisResultDto,
    description: '이용자 원칙 기준',
  })
  getUserCreterion(@Request() req, @Param('isuSrtCd') isuSrtCd: string) {
    return this.analysisService.analyseCorpStock(req.user.userId, isuSrtCd);
  }
}
