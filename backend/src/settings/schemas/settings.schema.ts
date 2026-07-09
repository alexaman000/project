import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserSettingsDocument = UserSettings & Document;

@Schema({ timestamps: true })
export class UserSettings {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ default: true })
  emailNotifications: boolean;

  @Prop({ default: true })
  browserNotifications: boolean;

  @Prop({ default: 'UTC' })
  timezone: string;

  // Quiet Hours
  @Prop({ default: false })
  quietHoursEnabled: boolean;

  @Prop({ default: '22:00' })
  quietHoursStart: string;

  @Prop({ default: '07:00' })
  quietHoursEnd: string;
}

export const UserSettingsSchema = SchemaFactory.createForClass(UserSettings);
