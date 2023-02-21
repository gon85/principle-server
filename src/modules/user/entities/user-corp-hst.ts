import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

const ushDesc = {
  id: '',
  userId: '',
  isuSrtCd: '',
  price: '',
  createdAt: '',
};

@Entity({ name: 'user_corp_hst' })
export default class UserCorpHst {
  @PrimaryColumn({
    type: 'int',
    unsigned: true,
  })
  userId!: number;

  @PrimaryColumn({
    type: 'varchar',
    length: 12,
    comment: ushDesc.isuSrtCd,
  })
  isuSrtCd!: string;

  @Column({ type: 'int', unsigned: true, comment: ushDesc.price })
  price!: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  // @ManyToOne(() => UserMst)
  // @JoinColumn({ name: 'user_id' })
  // user!: UserMst;

  // @ManyToOne(() => CompanyMst)
  // @JoinColumn({ name: 'isu_srt_cd' })
  // company!: CompanyMst;
}
