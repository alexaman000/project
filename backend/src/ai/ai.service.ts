import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TodosService } from '../todos/todos.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;
  
  constructor(private readonly todosService: TodosService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is missing!');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
  }

  async handleChat(userId: string, userMessage: string): Promise<string> {
    try {
      // 1. Fetch the user's tasks
      const todos = await this.todosService.findAll(userId);
      
      // 2. Format tasks into a readable context string
      const taskList = todos.map(t => 
        `- [${t.isCompleted ? 'x' : ' '}] ${t.title}` + 
        (t.reminderDateTime ? ` (Reminder: ${new Date(t.reminderDateTime).toLocaleString()})` : '')
      ).join('\n');

      const systemPrompt = `You are a helpful, enthusiastic, and concise AI productivity assistant. 
The user is talking to you from their Todo App dashboard. 
Here are their current tasks:
${taskList || 'They have no tasks yet.'}

Respond directly to the user's message below, utilizing the context of their tasks to be as helpful as possible. Do not output markdown code blocks unnecessarily unless requested. 

User Message: "${userMessage}"`;

      // 3. Call Gemini
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      this.logger.error('AI Chat Error:', error.message);
      return "Oops! I'm having trouble connecting to my brain right now. Please check my API Key in the server configuration.";
    }
  }
}
