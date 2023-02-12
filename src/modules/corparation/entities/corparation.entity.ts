import { Column, Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import Hangul from 'hangul-js';

const cDesc = {
  isuSrtCd: 'KRX 종목코드(short)',
  isuCd: '종목코드(full)',
  isuAbbrv: '종목명 - 한글종목약명',
  kindStkcertTpNm: '보통주/우선주',
  isuNm: '종목명 + 보통주/우선주',
  corpCode: '',
  marketCd: 'market code (KP:kospi, KD:kosdaq)',
  isuNmDisassemble: '종목명-자음모음분리',
  createdAt: '',
  updatedAt: '',
};

@Entity({ name: 'corparation' })
export default class Corparation {
  @PrimaryColumn({
    type: 'varchar',
    length: 12,
    comment: cDesc.isuSrtCd,
  })
  isuSrtCd!: string;

  @Column({ type: 'varchar', length: 50, comment: cDesc.isuCd })
  isuCd!: string;

  @Column({ type: 'varchar', length: 100, comment: cDesc.isuAbbrv })
  isuAbbrv!: string;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: cDesc.kindStkcertTpNm })
  kindStkcertTpNm!: string;

  @Column({ type: 'varchar', length: 200, comment: cDesc.isuNm })
  isuNm!: string;

  @Column({
    type: 'varchar',
    length: 500,
    comment: cDesc.isuNmDisassemble,
    nullable: true,
  })
  isuNmDisassemble!: string;

  @Column({ type: 'varchar', length: 100, comment: cDesc.corpCode })
  corpCode!: string;

  // @OneToMany(() => UserCompanyStatsMst, (userStats) => userStats.company)
  // userStats!: UserCompanyStatsMst[];

  @CreateDateColumn()
  createdAt!: string;

  @UpdateDateColumn()
  updatedAt!: string;

  static create(isuSrtCd: string, isuAbbrv: string, isuCd: string, corpCode = '') {
    const c = new Corparation();
    c.isuCd = isuCd;
    c.isuSrtCd = isuSrtCd;
    c.isuNm = 'NM_' + isuAbbrv;
    c.isuAbbrv = isuAbbrv;
    c.isuNmDisassemble = Hangul.disassembleToString(isuAbbrv);
    c.isuCd = isuCd;
    c.corpCode = corpCode;
    return c;
  }
}
