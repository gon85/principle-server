import { HttpStatus } from '@nestjs/common';
import UserCreterionDto from '@src/modules/creterions/dto/user-creterion.dto';
import { UserTester } from '../testers/user-tester';

export class CreterionSenario {
  private userTester: UserTester;

  constructor(userTester: UserTester) {
    this.userTester = userTester;
  }

  public async addCreterion(ucdTarget: UserCreterionDto) {
    const repUCSaved = await this.userTester.post('/api/creterions', ucdTarget);
    repUCSaved.status !== HttpStatus.CREATED ? console.log('---->', repUCSaved.error) : '';
    return repUCSaved.body as UserCreterionDto;
  }
}
