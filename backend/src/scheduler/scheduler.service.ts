import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo, TodoDocument } from '../todos/schemas/todo.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectModel(Todo.name) private todoModel: Model<TodoDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Runs every minute to check for due reminders.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleReminders() {
    const now = new Date();
    const windowStart = new Date(now.getTime() - 60 * 1000); // 1 minute ago

    try {
      // Find all reminder-enabled, not-yet-sent todos where the computed trigger time is in [windowStart, now]
      const todos = await this.todoModel.find({
        reminderEnabled: true,
        reminderSent: false,
        isCompleted: false,
        reminderDateTime: { $ne: null },
      }).exec();

      for (const todo of todos) {
        try {
          if (!todo.reminderDateTime) continue;

          // Compute the actual moment the reminder should fire:
          // reminderDateTime is the task due time; subtract reminderBeforeMinutes
          const triggerTime = new Date(
            todo.reminderDateTime.getTime() - (todo.reminderBeforeMinutes || 0) * 60 * 1000,
          );

          if (triggerTime >= windowStart && triggerTime <= now) {
            await this.processReminder(todo);
          }
        } catch (innerErr) {
          this.logger.error(`Error processing reminder for todo ${todo._id}:`, innerErr.message);
        }
      }
    } catch (err) {
      this.logger.error('Scheduler error:', err.message);
    }
  }

  private async processReminder(todo: TodoDocument) {
    const userId = todo.userId.toString();

    // Fetch user email
    const user = await this.userModel.findById(userId).exec();
    if (!user) return;

    // Parse meta from description for priority/category if stored as JSON
    let priority = 'Medium';
    let category = 'General';
    let description = todo.description || '';
    try {
      const meta = JSON.parse(todo.description || '{}');
      if (meta.priority) priority = meta.priority;
      if (meta.category) category = meta.category;
      if (meta.actualDescription) description = meta.actualDescription;
    } catch {}

    const reminderBeforeMinutes = todo.reminderBeforeMinutes || 0;
    const reminderLabel =
      reminderBeforeMinutes === 0
        ? 'at the exact time'
        : reminderBeforeMinutes < 60
        ? `${reminderBeforeMinutes} minutes before`
        : reminderBeforeMinutes < 1440
        ? `${reminderBeforeMinutes / 60} hour(s) before`
        : '1 day before';

    // 1. Create in-app notification
    const notification = await this.notificationsService.create({
      userId,
      todoId: todo._id.toString(),
      title: `⏰ Reminder: ${todo.title}`,
      message: `Your task "${todo.title}" is due ${reminderLabel}.`,
      type: 'reminder',
    });

    // 2. Push live WebSocket notification
    this.notificationsGateway.sendNotificationToUser(userId, {
      _id: notification._id,
      title: notification.title,
      message: notification.message,
      todoId: todo._id,
      type: 'reminder',
      read: false,
      createdAt: new Date(),
    });

    // 3. Send email
    const emailSent = await this.emailService.sendReminderEmail({
      to: user.email,
      taskTitle: todo.title,
      description,
      priority,
      category,
      dueDateTime: todo.reminderDateTime,
      reminderBeforeMinutes,
    });

    // 4. Mark reminder as sent
    await this.todoModel.findByIdAndUpdate(todo._id, {
      reminderSent: true,
      emailSent,
      notificationSent: true,
      lastReminderSent: new Date(),
    });

    // 5. If recurring, schedule next reminder
    if (todo.isRecurring && todo.recurringType && todo.reminderDateTime) {
      const next = this.computeNextRecurrence(todo.reminderDateTime, todo.recurringType);
      await this.todoModel.findByIdAndUpdate(todo._id, {
        reminderDateTime: next,
        reminderSent: false,
        emailSent: false,
        notificationSent: false,
      });
    }

    this.logger.log(`Reminder processed for todo "${todo.title}" (userId: ${userId})`);
  }

  private computeNextRecurrence(current: Date, type: string): Date {
    const next = new Date(current);
    switch (type) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
      case 'weekdays':
        do { next.setDate(next.getDate() + 1); } while ([0, 6].includes(next.getDay()));
        break;
      case 'weekends':
        do { next.setDate(next.getDate() + 1); } while (![0, 6].includes(next.getDay()));
        break;
      default:
        next.setDate(next.getDate() + 1);
    }
    return next;
  }
}
