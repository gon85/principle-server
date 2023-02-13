import { HttpStatus } from '@nestjs/common';
import { UserRegisterDto } from '@src/modules/user/dtos/user-register.dto';
import User from '@src/modules/user/entities/user.entity';
import { getTester, testingHelper } from './commons/testing-helper';

describe('Test auth e2e ', () => {
  beforeAll(testingHelper.beforeAll);
  afterAll(testingHelper.afterAll);
  beforeEach(async () => {
    await testingHelper.beforeEach();
  });

  it('Test register to login', async () => {
    const prepareTestData = async () => {
      const uRepo = testingHelper.getRepository<User>(User);
      const tester = getTester();
      const userInfo: UserRegisterDto = {
        email: 'tester001@e2e.com',
        pw: '01!!principle',
        firstName: 'James',
        lastName: 'Smith',
      };

      // 기존에 있으면 삭제
      await uRepo.delete({ email: userInfo.email });

      return {
        tester,
        userInfo,
        uRepo,
      };
    };
    const { tester, uRepo, userInfo } = await prepareTestData();

    const rep = await tester.post('/api/auth/register', userInfo);
    rep.status !== HttpStatus.CREATED ? console.log('---->', rep.error) : '';
    expect(rep.status).toEqual(HttpStatus.CREATED);
    const user = await uRepo.findOne({ where: { email: userInfo.email } });
    expect(user.pw).not.toEqual(userInfo.pw);

    const repLogin = await tester.post('/api/auth/login', { email: userInfo.email, pass: userInfo.pw });
    repLogin.status !== HttpStatus.CREATED ? console.log('---->', repLogin.error) : '';
    expect(repLogin.status).toEqual(HttpStatus.CREATED);
  });
});
