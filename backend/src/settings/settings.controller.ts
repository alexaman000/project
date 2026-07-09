import {
  Controller,
  Get,
  Patch,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings(@Request() req: any) {
    return this.settingsService.getSettings(req.user.userId);
  }

  @Patch()
  updateSettings(@Request() req: any, @Body() body: any) {
    return this.settingsService.updateSettings(req.user.userId, body);
  }
}
