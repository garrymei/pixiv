import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Banner } from '../../database/entities/banner.entity'

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannersRepo: Repository<Banner>
  ) {}

  async list(position = 'home_top') {
    const where = position ? { position, status: 1 } : { status: 1 }
    const list = await this.bannersRepo.find({
      where,
      order: { sortOrder: 'DESC', id: 'DESC' }
    })

    return {
      list: list.map((item) => ({
        id: item.id,
        title: item.title || '',
        subtitle: '',
        image_url: item.imageUrl,
        link_url: item.jumpLink || '',
        position: item.position,
        sort_order: item.sortOrder
      })),
      total: list.length
    }
  }
}
