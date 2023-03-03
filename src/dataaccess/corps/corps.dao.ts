import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Corparation from '@src/modules/corparation/entities/corparation.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CorpsDao {
  constructor(
    @InjectRepository(Corparation)
    private corpRepo: Repository<Corparation>,
  ) {}

  public findCorp(isuSrtCd: string) {
    const qbMain = this.corpRepo.createQueryBuilder('c').where('c.isu_srt_cd = :isuSrtCd', { isuSrtCd });
    return qbMain.getOne();
  }
}
