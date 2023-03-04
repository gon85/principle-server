import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/modules/auth/guards/jwt-auth.guard';
import { AnalysisResultDto } from '../dto/analysis-corp-stock.dto';
import { AnalysisPeriodDto } from '../dto/analysis-period.dto';
import { AnalysisProfitDto } from '../dto/analysis-profit.dto';
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
      이용자 원칙 기준에 따른 분석 결과를 조회합니다.
    `,
  })
  @ApiOkResponse({
    type: AnalysisResultDto,
    description: '이용자 원칙 기준 따른 분석결과',
  })
  analyseCorpStock(@Request() req, @Param('isuSrtCd') isuSrtCd: string, @Query('tmId') tmId: number | undefined) {
    return this.analysisService.analyseCorpStock(req.user.userId, isuSrtCd, tmId);
  }

  @Get(':isuSrtCd/:itemType')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: `
      이용자 원칙 아이템에 따른 분석 결과를 조회합니다.
    `,
  })
  @ApiExtraModels(AnalysisPeriodDto, AnalysisProfitDto)
  @ApiOkResponse({
    schema: { anyOf: refs(AnalysisPeriodDto, AnalysisProfitDto) },
  })
  analyseItemCorpStock(
    @Request() req,
    @Param('isuSrtCd') isuSrtCd: string,
    @Param('itemType') itemType: string,
    @Query('tmId') tmId: number | undefined,
  ) {
    return this.analysisService.analyseItemCorpStock(req.user.userId, isuSrtCd, itemType, tmId);
  }
}
