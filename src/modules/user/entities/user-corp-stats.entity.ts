import Corparation from '@src/modules/corparation/entities/corparation.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

const Description = {
  hstCount: '',
  hstCountTm: '3개월이력',
  hstLastAt: '',
  favoriteCount: '',
  favoriteLastAt: '',
};

@Entity()
export default class UserCorpStats {
  @PrimaryColumn({
    type: 'int',
    unsigned: true,
  })
  userId: number;

  @PrimaryColumn({
    type: 'varchar',
    length: 12,
  })
  isuSrtCd!: string;

  @Column({ type: 'int', unsigned: true, default: 0, comment: Description.hstCount })
  hstCount!: number;

  @Column({ type: 'int', unsigned: true, default: 0, comment: Description.hstCountTm })
  hstCountTm!: number;

  @Column({ type: 'datetime', nullable: true, comment: Description.hstLastAt })
  hstLastAt?: Date;

  @Column({ type: 'int', unsigned: true, default: 0, comment: Description.favoriteCount })
  favoriteCount!: number;

  @Column({ type: 'datetime', nullable: true, comment: Description.favoriteLastAt })
  favoriteLastAt?: Date;

  @ManyToOne(() => Corparation)
  @JoinColumn({ name: 'isu_srt_cd' })
  corparation?: Corparation;
}
