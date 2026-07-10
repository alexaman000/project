import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { TodosModule } from '../todos/todos.module';

@Module({
  imports: [TodosModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
