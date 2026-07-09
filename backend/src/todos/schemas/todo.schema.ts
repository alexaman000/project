import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TodoDocument = Todo & Document;

@Schema({ timestamps: true })
export class Todo {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  // --- Reminder Fields ---
  @Prop({ default: false })
  reminderEnabled: boolean;

  @Prop({ type: Date, default: null })
  reminderDateTime: Date | null;

  @Prop({ default: 0 }) // minutes before due time to send reminder
  reminderBeforeMinutes: number;

  @Prop({ default: 'UTC' })
  timezone: string;

  @Prop({ default: false })
  reminderSent: boolean;

  @Prop({ type: Date, default: null })
  lastReminderSent: Date | null;

  // --- Recurring ---
  @Prop({ default: false })
  isRecurring: boolean;

  @Prop({
    type: String,
    enum: [
      'daily',
      'weekly',
      'monthly',
      'yearly',
      'weekdays',
      'weekends',
      'custom',
      null,
    ],
    default: null,
  })
  recurringType: string | null;

  // --- Notification tracking ---
  @Prop({ default: false })
  notificationSent: boolean;

  @Prop({ default: false })
  emailSent: boolean;

  // Due date for the task (separate from reminder)
  @Prop({ type: Date, default: null })
  dueDateTime: Date | null;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
