import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
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

  async listForAdmin(position?: string) {
    const list = await this.bannersRepo.find({
      where: position ? { position } : {},
      order: { sortOrder: 'DESC', id: 'DESC' }
    })
    return {
      list: list.map((item) => ({
        id: item.id,
        title: item.title || '',
        image_url: item.imageUrl,
        jump_link: item.jumpLink || '',
        link_url: item.jumpLink || '',
        position: item.position,
        sort_order: item.sortOrder,
        status: item.status,
        created_at: item.createdAt?.getTime?.() || null,
        updated_at: item.updatedAt?.getTime?.() || null
      })),
      total: list.length
    }
  }

  async create(payload: Partial<Banner>) {
    const imageUrl = String(payload.imageUrl || '').trim()
    if (!imageUrl) throw new BadRequestException('image_url required')
    const item = this.bannersRepo.create({
      title: String(payload.title || '').trim(),
      imageUrl,
      jumpLink: String(payload.jumpLink || '').trim(),
      position: String(payload.position || 'home_top').trim(),
      sortOrder: Number(payload.sortOrder || 0),
      status: Number(payload.status ?? 1)
    })
    const saved = await this.bannersRepo.save(item)
    return (await this.listForAdmin()).list.find((banner) => banner.id === saved.id) || saved
  }

  async update(id: number, payload: Partial<Banner>) {
    const item = await this.bannersRepo.findOne({ where: { id } })
    if (!item) throw new NotFoundException('banner not found')
    if (payload.title !== undefined) item.title = String(payload.title || '').trim()
    if (payload.imageUrl !== undefined) item.imageUrl = String(payload.imageUrl || '').trim()
    if (payload.jumpLink !== undefined) item.jumpLink = String(payload.jumpLink || '').trim()
    if (payload.position !== undefined) item.position = String(payload.position || 'home_top').trim()
    if (payload.sortOrder !== undefined) item.sortOrder = Number(payload.sortOrder || 0)
    if (payload.status !== undefined) item.status = Number(payload.status)
    if (!item.imageUrl) throw new BadRequestException('image_url required')
    const saved = await this.bannersRepo.save(item)
    return (await this.listForAdmin()).list.find((banner) => banner.id === saved.id) || saved
  }
}
