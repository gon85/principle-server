import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

const uDesc = {
  id: 'user key',
  email: 'user email',
  pw: 'user password',
  firstName: 'first name',
  lastName: 'last name',
  isActive: '휴면여부',
  isDeleted: '탈퇴여부',
};

@Entity('user')
@Index('ui_user', ['email'])
export default class User {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    unsigned: true,
    comment: uDesc.id,
  })
  id: number;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 500,
    nullable: false,
    comment: uDesc.email,
  })
  email: string;

  @Column({
    name: 'pw',
    type: 'varchar',
    length: 500,
    nullable: false,
    comment: uDesc.pw,
  })
  pw: string;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: uDesc.firstName,
  })
  firstName: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: uDesc.lastName,
  })
  lastName: string;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    width: 1,
    nullable: false,
    default: 1,
    comment: uDesc.isActive,
  })
  isActive: boolean;

  @Column({
    name: 'is_deleted',
    type: 'tinyint',
    width: 1,
    nullable: false,
    default: 0,
    comment: uDesc.isDeleted,
  })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
