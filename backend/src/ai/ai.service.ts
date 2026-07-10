import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';
import { TodosService } from '../todos/todos.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private groq: Groq;

  constructor(private readonly todosService: TodosService) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY is missing!');
    }
    this.groq = new Groq({ apiKey: apiKey || '' });
  }

  async handleChat(
    userId: string,
    userMessage: string,
    history: { role: 'user' | 'model'; text: string }[] = [],
  ): Promise<string> {
    try {
      // 1. Fetch the user's tasks for context
      const todos = await this.todosService.findAll(userId);

      const pending = todos.filter((t) => !t.isCompleted);
      const completed = todos.filter((t) => t.isCompleted);

      const formatTask = (t: any) =>
        `• ${t.title}` +
        (t.reminderDateTime
          ? ` (Reminder: ${new Date(t.reminderDateTime).toLocaleString()})`
          : '');

      const taskContext = `
Pending tasks (${pending.length}):
${pending.length ? pending.map(formatTask).join('\n') : 'None'}

Completed tasks (${completed.length}):
${completed.length ? completed.map(formatTask).join('\n') : 'None'}`.trim();

      const systemPrompt = `You are a smart, friendly, and concise AI productivity assistant built into a Todo App.
You have real-time access to the user's task list shown below. Use this context to give specific, personalized answers.
Never say you don't have access to the tasks — you do. Be encouraging and keep responses short and actionable.
Current date and time: ${new Date().toLocaleString()}

User's Task List:
${taskContext}`;

      // 2. Build chat history for multi-turn conversation
      const messages: Groq.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...history.map((h) => ({
          role: h.role === 'model' ? ('assistant' as const) : ('user' as const),
          content: h.text,
        })),
        { role: 'user', content: userMessage },
      ];

      // 3. Call Groq
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 512,
      });

      return completion.choices[0]?.message?.content || 'No response generated.';
    } catch (error: any) {
      this.logger.error('AI Chat Error:', error.message);
      if (error.message?.includes('quota') || error.message?.includes('429')) {
        return '⚠️ AI quota exceeded. Please check your GROQ_API_KEY in Render environment variables.';
      }
      if (error.message?.includes('API key') || error.message?.includes('auth') || error.message?.includes('401')) {
        return '⚠️ Invalid API key. Please add a valid GROQ_API_KEY to your Render environment variables. Get one free at console.groq.com';
      }
      return "Oops! I'm having trouble connecting right now. Please check the GROQ_API_KEY in Render environment variables.";
    }
  }
}
