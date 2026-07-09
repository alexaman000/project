import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(data: {
    userId: string;
    todoId: string;
    title: string;
    message: string;
    type?: string;
  }): Promise<NotificationDocument> {
    const notification = new this.notificationModel({
      userId: new Types.ObjectId(data.userId),
      todoId: new Types.ObjectId(data.todoId),
      title: data.title,
      message: data.message,
      type: data.type || 'reminder',
    });
    return notification.save();
  }

  async findAllForUser(userId: string): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  async markAsRead(
    id: string,
    userId: string,
  ): Promise<NotificationDocument | null> {
    return this.notificationModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { read: true },
        { new: true },
      )
      .exec();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel
      .updateMany(
        { userId: new Types.ObjectId(userId), read: false },
        { read: true },
      )
      .exec();
  }

  async delete(id: string, userId: string): Promise<any> {
    return this.notificationModel
      .findOneAndDelete({
        _id: id,
        userId: new Types.ObjectId(userId),
      })
      .exec();
  }

  async countUnread(userId: string): Promise<number> {
    return this.notificationModel
      .countDocuments({
        userId: new Types.ObjectId(userId),
        read: false,
      })
      .exec();
  }
}
