import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserSettings, UserSettingsDocument } from './schemas/settings.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(UserSettings.name)
    private settingsModel: Model<UserSettingsDocument>,
  ) {}

  async getSettings(userId: string): Promise<UserSettingsDocument> {
    let settings = await this.settingsModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();
    if (!settings) {
      settings = new this.settingsModel({ userId: new Types.ObjectId(userId) });
      await settings.save();
    }
    return settings;
  }

  async updateSettings(
    userId: string,
    updates: Partial<UserSettings>,
  ): Promise<UserSettingsDocument | null> {
    return this.settingsModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { $set: updates },
        { new: true, upsert: true },
      )
      .exec();
  }
}
