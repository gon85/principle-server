import { HttpStatus, INestApplication } from '@nestjs/common';
import { getTester } from '../testing-helper';

export class AuthSenarioTest {
  private app: INestApplication;

  constructor(app: INestApplication) {
    this.app = app;
  }

  public async addUser(email: string, pw: string) {
    const tester = getTester();

    const rep = await tester.post('/api/auth/register', {
      email,
      pw,
      firstName: email.split('@')[0],
      lastName: 'smith',
    });
    rep.status !== HttpStatus.CREATED ? console.log('---->', rep.error) : '';
    expect(rep.status).toEqual(HttpStatus.CREATED);
  }
}
