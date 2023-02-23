import { transformBoolean } from '@src/commons/utils/transformer-utils';
import User from '@src/modules/user/entities/user.entity';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { AlarmCategories } from '../types/enums';

const desc = {
  userId: 'user kery',
  alarmCategoryCd: 'alarm category code',
  time: '알람 시간 (HH:mm)',
  isUse: '사용여부',
};

@Entity('user_alarm')
export default class UserAlarm {
  @PrimaryColumn({
    type: 'int',
    unsigned: true,
    comment: desc.userId,
  })
  @IsOptional()
  userId: number;

  @Column({
    type: 'varchar',
    length: 8,
    comment: desc.alarmCategoryCd,
  })
  @IsString()
  alarmCategoryCd: AlarmCategories;

  @Column({
    type: 'varchar',
    length: 5,
    comment: desc.time,
  })
  @IsString()
  time: string;

  @Column({
    type: 'tinyint',
    comment: desc.isUse,
  })
  @IsBoolean()
  @Transform(transformBoolean)
  isUse: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (u) => u.alarms)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user?: User;
}
