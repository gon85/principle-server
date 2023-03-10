import UserAlarm from '@src/modules/creterions/entities/user_alarm.entity';
import UserCreterion from '@src/modules/creterions/entities/user_creterion.entity';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  @IsEmail()
  email: string;

  @Column({
    name: 'pw',
    type: 'varchar',
    length: 500,
    nullable: false,
    comment: uDesc.pw,
  })
  @IsString()
  pw: string;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: uDesc.firstName,
  })
  @IsOptional()
  firstName: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: uDesc.lastName,
  })
  @IsOptional()
  lastName: string;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    width: 1,
    nullable: false,
    default: 1,
    comment: uDesc.isActive,
  })
  @IsOptional()
  isActive: boolean;

  @Column({
    name: 'is_deleted',
    type: 'tinyint',
    width: 1,
    nullable: false,
    default: 0,
    comment: uDesc.isDeleted,
  })
  @IsOptional()
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => UserCreterion, (uc) => uc.user)
  creterion?: UserCreterion;

  @OneToMany(() => UserAlarm, (ua) => ua.user)
  alarms?: UserAlarm[];
}
