import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import PageInfoDto from '@src/commons/dto/page-info.dto';
import { ErrorHandler, ErrorCodes } from '@src/commons/errorhandler';
import User from '@src/modules/user/entities/user.entity';
import { findIndex, flatten, isBoolean, isEmpty, isNumber, isString, omit, omitBy, orderBy, pick } from 'lodash';
import { DataSource, EntityManager, IsNull, Not, Repository } from 'typeorm';
import UserAlarmDto from '../dto/user-alarm.dto';
import UserCreterionInfoDto from '../dto/user-creterion-info.dto';
import UserCreterionDto from '../dto/user-creterion.dto';
import UserAlarm from '../entities/user_alarm.entity';
import UserCreterion from '../entities/user_creterion.entity';

@Injectable()
export class CreterionService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(User)
    private uRepo: Repository<User>,
    @InjectRepository(UserCreterion)
    private ucRepo: Repository<UserCreterion>,
    @InjectRepository(UserAlarm)
    private uaRepo: Repository<UserAlarm>,
  ) {}

  public async getUserCreterion(userId: number) {
    const qbMain = this.createQBUserCreterion(userId);
    const userInfo = await qbMain.getOne();

    ErrorHandler.checkThrow(!userInfo, ErrorCodes.NOT_FOUND_USER);

    return {
      creterion: userInfo.creterion,
      alarms: userInfo.alarms,
    } as UserCreterionInfoDto;
  }

  public async saveUserCreterion(userId: number, uc: UserCreterionDto) {
    const ucTarget = omitBy(uc, (val) => {
      if (val === null || val === undefined) return true;
      if (isString(val)) {
        return isEmpty(val);
      } else if (isNumber(val)) {
        return false;
      } else if (isBoolean(val)) {
        return false;
      }
      return true; // 객체 제거.
    });

    const ucSaved = await this.ucRepo.save({
      ...ucTarget,
      userId,
    });

    return ucSaved;
  }

  public async saveUserAlarms(userId: number, uadParam: UserAlarmDto) {
    const ucTarget = omitBy(uadParam, (val) => {
      if (val === null || val === undefined) return true;
      if (isString(val)) {
        return isEmpty(val);
      } else if (isNumber(val)) {
        return false;
      } else if (isBoolean(val)) {
        return false;
      }
      return true; // 객체 제거.
    });

    await this.uaRepo.save({
      ...ucTarget,
      userId,
    });

    return this.uaRepo.find({ where: { userId } });
  }

  private createQBUserCreterion(userId: number) {
    const qbMain = this.uRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.creterion', 'uc')
      .leftJoinAndSelect('u.alarms', 'ua')
      .where('u.id = :userId', { userId });

    return qbMain;
  }
}
