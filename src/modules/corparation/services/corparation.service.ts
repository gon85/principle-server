import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import clientAxios from '@src/commons/api-clients/client-axios';
import * as hangul from 'hangul-js';
import { Repository } from 'typeorm';
import Corparation from '../entities/corparation.entity';

@Injectable()
export class CorparationService {
  constructor(
    @InjectRepository(Corparation)
    private corRepo: Repository<Corparation>,
  ) {}

  public async initializeCorpCodes() {
    // 코스피, 코스닥
    await this.corRepo.upsert(this.getDefaultCorps(), ['isuSrtCd']);

    const rep = await clientAxios.getStockAllCode();
    const stockCodes = rep.OutBlock_1;
    await this.addCorporationCode(stockCodes);

    const repEtf = await clientAxios.getETFAllCode();
    const etfCodes = repEtf.output;
    await this.addCorporationCode(etfCodes);
  }

  private getDefaultCorps() {
    const kospi = this.corRepo.create({
      isuSrtCd: 'KOSPI',
      isuCd: 'KOSPI',
      isuAbbrv: '코스피 (KOSPI)',
      kindStkcertTpNm: '',
      isuNm: 'KOSPI',
      isuNmDisassemble: hangul.disassembleToString('코스피 (KOSPI)'),
      corpCode: '',
    });
    const kosdaq = this.corRepo.create({
      isuSrtCd: 'KOSDAQ',
      isuCd: 'KOSDAQ',
      isuAbbrv: '코스닥 (KOSDAQ)',
      kindStkcertTpNm: '',
      isuNm: 'KOSDAQ',
      isuNmDisassemble: hangul.disassembleToString('코스닥 (KOSDAQ)'),
      corpCode: '',
    });
    return [kospi, kosdaq];
  }

  private async addCorporationCode(stockCodes: any[], kindStkcertTpNm = 'ETF') {
    for (let index = 0; index < stockCodes.length; index++) {
      const krxCode = stockCodes[index];
      const corp = this.corRepo.create({
        isuSrtCd: krxCode.ISU_SRT_CD,
        isuCd: krxCode.ISU_CD,
        isuAbbrv: krxCode.ISU_ABBRV,
        kindStkcertTpNm: krxCode.KIND_STKCERT_TP_NM || kindStkcertTpNm,
        isuNm: krxCode.ISU_NM,
        isuNmDisassemble: hangul.disassembleToString(krxCode.ISU_ABBRV),
        corpCode: '',
      });
      await this.corRepo.upsert(corp, ['isuSrtCd']);
    }
  }
}