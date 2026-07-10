import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, Content } from '@google/generative-ai';
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

      // 2. Build the system instruction
      const systemInstruction = `You are a smart, friendly, and concise AI productivity assistant built into a Todo App.
You have real-time access to the user's task list shown below. Use this context to give specific, personalized answers.
Never say you "don't have access" to the tasks — you do. Be encouraging and keep responses short and actionable.
Current date and time: ${new Date().toLocaleString()}

User's Task List:
${taskContext}`;

      // 3. Build chat history for multi-turn conversation
      const chatHistory: Content[] = history.map((h) => ({
        role: h.role,
        parts: [{ text: h.text }],
      }));

      // 4. Start chat session with history
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction,
      });

      const chat = model.startChat({ history: chatHistory });
      const result = await chat.sendMessage(userMessage);
      return result.response.text();
    } catch (error: any) {
      this.logger.error('AI Chat Error:', error.message);
      if (error.message?.includes('quota') || error.message?.includes('429')) {
        return "⚠️ The AI quota has been exceeded. Please generate a new Gemini API key at aistudio.google.com/app/apikey and update it in your Render environment variables.";
      }
      return "Oops! I'm having trouble connecting right now. Please check the API Key in Render environment variables.";
    }
  }
}
