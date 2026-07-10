import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(
    @Request() req: any,
    @Body('message') message: string,
    @Body('history') history: { role: 'user' | 'model'; text: string }[] = [],
  ) {
    if (!message) {
      return { reply: 'Please provide a message.' };
    }
    const reply = await this.aiService.handleChat(req.user.userId, message, history);
    return { reply };
  }
}
