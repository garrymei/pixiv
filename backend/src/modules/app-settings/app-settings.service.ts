import { ForbiddenException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AppSetting } from '../../database/entities/app-setting.entity'

@Injectable()
export class AppSettingsService {
  constructor(
    @InjectRepository(AppSetting)
    private readonly appSettingsRepo: Repository<AppSetting>
  ) {}

  private async ensureRecord() {
    let item = await this.appSettingsRepo.findOne({ where: { id: 1 } })
    if (!item) {
      item = await this.appSettingsRepo.save(
        this.appSettingsRepo.create({
          id: 1,
          publishEnabled: 0
        })
      )
    }
    return item
  }

  async getPublicSettings() {
    const item = await this.ensureRecord()
    return {
      publish_enabled: item.publishEnabled === 1
    }
  }

  async getAdminSettings() {
    const item = await this.ensureRecord()
    return {
      id: item.id,
      publish_enabled: item.publishEnabled,
      created_at: item.createdAt?.getTime?.() || null,
      updated_at: item.updatedAt?.getTime?.() || null
    }
  }

  async updateSettings(payload: { publish_enabled?: number | boolean }) {
    const item = await this.ensureRecord()
    if (payload.publish_enabled !== undefined) {
      item.publishEnabled = payload.publish_enabled ? 1 : 0
    }
    const saved = await this.appSettingsRepo.save(item)
    return {
      id: saved.id,
      publish_enabled: saved.publishEnabled,
      created_at: saved.createdAt?.getTime?.() || null,
      updated_at: saved.updatedAt?.getTime?.() || null
    }
  }

  async assertPublishEnabled() {
    const item = await this.ensureRecord()
    if (item.publishEnabled !== 1) {
      throw new ForbiddenException('当前版本暂未开放发布入口')
    }
  }
}
