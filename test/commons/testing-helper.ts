import { INestApplication, Type, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AppModule } from '@src/app.module';
// import { AdminTester } from './testers/admin-tester';
// import { UserInfo, UserTester } from './testers/user-tester';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { ObjectLiteral, Repository } from 'typeorm';
import { UserTester } from './testers/user-tester';

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

// const setNow = (val: string) => {
//   spyOnTime = jest.spyOn(datetimeUtils, 'getNowMoment').mockImplementation(() => {
//     return moment(val, 'YYYY-MM-DD HH:mm:ss').clone();
//   });
// };
// const resetNow = () => {
//   if (spyOnTime) {
//     spyOnTime.mockRestore();
//   }
// };

export const testingHelper = {
  getApp,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  // setNow,
  // resetNow,
  getRepository,
  getService,
};

export async function getUserTester(email = 'adminDevTester@thegifting.io', pw = '01!!xfortesting') {
  const client = request(appLola.getHttpServer());
  const user = new UserTester(client);
  await user.login(email, pw);

  return user;
}
