import { Controller, Get } from '@nestjs/common'
import { AppSettingsService } from './app-settings.service'

@Controller('app-settings')
export class AppSettingsController {
  constructor(private readonly appSettingsService: AppSettingsService) {}

  @Get()
  async getPublicSettings() {
    return this.appSettingsService.getPublicSettings()
  }
}
