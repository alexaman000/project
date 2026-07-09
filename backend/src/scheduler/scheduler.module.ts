import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchedulerService } from './scheduler.service';
import { Todo, TodoSchema } from '../todos/schemas/todo.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Todo.name, schema: TodoSchema },
      { name: User.name, schema: UserSchema },
    ]),
    EmailModule,
    NotificationsModule,
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
