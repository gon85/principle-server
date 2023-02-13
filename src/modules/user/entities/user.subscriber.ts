import { InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import User from './user.entity';
// import { AuthService } from '../auth.service';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  // constructor(
  //   connection: Connection,
  //   // private readonly authService: AuthService,
  // ) {
  //   connection.subscribers.push(this);
  // }

  listenTo() {
    return User;
  }

  private async hashPassword(event: InsertEvent<User> | UpdateEvent<User>): Promise<void> {
    if (event.entity?.pw) {
      try {
        event.entity.pw = await bcrypt.hash(event.entity.pw, 10);
      } catch (err) {
        throw new InternalServerErrorException(err);
      }
    }
  }

  private async validateEmail(event: InsertEvent<User> | UpdateEvent<User>, dupCount: number) {
    // const count = await this.authService.countAdminByEmail(event.entity.email);
    // if (count > dupCount) {
    //   throw new ConflictException({
    //     message: 'email is duplicated',
    //   });
    // }
  }

  async beforeInsert(event: InsertEvent<User>) {
    await this.validateEmail(event, 0);
    await this.hashPassword(event);
  }

  // async beforeUpdate(event: UpdateEvent<User>) {
  //   await this.validateEmail(event, 1);
  //   event.entity!.passwordUpdatedAt = new Date();
  //   await this.hashPassword(event);
  // }
}
