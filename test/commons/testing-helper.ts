import { INestApplication, Type, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { AppModule } from '@src/app.module';
// import { AdminTester } from './testers/admin-tester';
// import { UserInfo, UserTester } from './testers/user-tester';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { DataSource, In, ObjectLiteral, Repository } from 'typeorm';
import { UserTester } from './testers/user-tester';
import User from '@src/modules/user/entities/user.entity';
import TradingMst from '@src/modules/tradings/entities/trading-mst.entity';
import TradingTrx from '@src/modules/tradings/entities/trading-trx.entity';
import { AuthSenarioTest } from './senarios/auth-senarios-test';
import UserCorpHst from '@src/modules/user/entities/user-corp-hst';
import UserCorpStats from '@src/modules/user/entities/user-corp-stats.entity';
import datetimeUtils from '@src/commons/utils/datetime-utils';
import dayjs from 'dayjs';
import UserCreterion from '@src/modules/creterions/entities/user_creterion.entity';
import UserAlarm from '@src/modules/creterions/entities/user_alarm.entity';
import UserCreterionDto from '@src/modules/creterions/dto/user-creterion.dto';
import { CreterionSenario } from './senarios/creterion-senarios';

let appLola: INestApplication;

jest.setTimeout(1000 * 60 * 5);

const beforeAll = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  appLola = moduleFixture.createNestApplication();
  appLola.setGlobalPrefix('/api');
  appLola.enableVersioning({ type: VersioningType.URI });
  appLola.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await appLola.init();
};

const afterAll = async () => {
  await appLola.close();
};

let spyOnTime: jest.SpyInstance;

const beforeEach = async (ignoreDB = false) => {
  const conn = appLola.get(getDataSourceToken());

  if (spyOnTime) {
    spyOnTime.mockRestore();
  }
  console.log('----> conn:', conn.options.database, '-->', expect.getState().currentTestName);
  // if (conn.options.database === 'dev_test_tf') {
  //   await conn.dropDatabase();
  //   await conn.synchronize();
  // }
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const afterEach = async () => {};

const getApp = () => {
  return appLola;
};

const getRepository = <T extends ObjectLiteral>(entity: EntityClassOrSchema): Repository<T> => {
  return appLola.get<Repository<T>>(getRepositoryToken(entity));
};

const getService = <T>(token: Type<T>) => {
  return appLola.get<T>(token);
};

const setNow = (val: string) => {
  spyOnTime = jest.spyOn(datetimeUtils, 'getNowDayjs').mockImplementation(() => {
    return dayjs(val, 'YYYY-MM-DD HH:mm:ss').clone();
  });
};
const resetNow = () => {
  if (spyOnTime) {
    spyOnTime.mockRestore();
  }
};

export const testingHelper = {
  getApp,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  setNow,
  resetNow,
  getRepository,
  getService,
};

async function resetTestDataByEmail(email: string, resetData = true) {
  const dataSource = getApp().get<DataSource>(DataSource);

  const u = await dataSource.getRepository(User).findOne({ where: { email } });
  if (!u) return null;
  if (resetData === false) return u;

  const tmRepo = dataSource.getRepository(TradingMst);
  const ttRepo = dataSource.getRepository(TradingTrx);

  const tradings = await tmRepo.find({ where: { userId: u.id } });
  const tIds = tradings.map((t) => t.id);
  await ttRepo.delete({ tradingId: In(tIds) });
  await tmRepo.delete({ id: In(tIds) });
  await dataSource.getRepository(UserCorpHst).delete({ userId: u.id });
  await dataSource.getRepository(UserCorpStats).delete({ userId: u.id });
  await dataSource.getRepository(UserCreterion).delete({ userId: u.id });
  await dataSource.getRepository(UserAlarm).delete({ userId: u.id });

  return u;
}

interface Options {
  pw?: string;
  resetData?: boolean;
  ucd?: UserCreterionDto;
}

export async function getUserTester(
  emailId: string,
  options: Options = {
    resetData: true,
    pw: '01!!xfortesting',
    ucd: {
      targetProfitRatio: 10,
      maxLossRatio: -5,
      investmentPeriod: 1,
      investmentPeriodUnit: 'M',
      maxHoldCorpCnt: 3,
      maxBuyingAmount: 2000000,
      maxFocusInterestCnt: 5,
    },
  },
) {
  const client = request(appLola.getHttpServer());
  const user = new UserTester(client);
  const email = `${emailId}@e2e.com`;

  const { resetData, pw } = { resetData: true, pw: '01!!xfortesting', ...options };
  const dbUser = await resetTestDataByEmail(email, resetData);
  if (!dbUser) {
    const ast = new AuthSenarioTest(appLola);
    await ast.addUser(email, pw);
  }
  await user.login(email, pw);

  if (options.ucd) {
    const cs = new CreterionSenario(user);
    cs.addCreterion(options.ucd);
  }

  return user;
}

export function getTester() {
  const client = request(appLola.getHttpServer());
  const user = new UserTester(client);

  return user;
}
