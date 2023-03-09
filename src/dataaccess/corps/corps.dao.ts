import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorCodes, ErrorHandler } from '@src/commons/errorhandler';
import Corparation from '@src/modules/corparation/entities/corparation.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class CorpsDao {
  constructor(
    @InjectRepository(Corparation)
    private corpRepo: Repository<Corparation>,
  ) {}

  public findCorp(isuSrtCd: string) {
    const qbMain = this.corpRepo.createQueryBuilder('c').where('c.isu_srt_cd = :isuSrtCd', { isuSrtCd });
    const corp = qbMain.getOne();

    ErrorHandler.checkThrow(!corp, ErrorCodes.NOT_FOUND);
    return corp;
  }

  public findAllWithoutOrdinary() {
    return this.corpRepo.find({ where: { kindStkcertTpNm: In(['INDEX', 'ETF']) } });
  }
}
