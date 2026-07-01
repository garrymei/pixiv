import { Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { PostsService } from '../posts/posts.service'
import { EventRegistrationService } from '../event-registration/event-registration.service'
import { DemandsService } from '../demands/demands.service'
import { DemandApplicationService } from '../demand-application/demand-application.service'
import { VenuesService } from '../venues/venues.service'

type MyBookingListItem = {
  id: string
  biz_type: 'event_registration' | 'venue_booking' | 'demand_created' | 'demand_applied'
  title: string
  subtitle: string
  status: string
  start_time: number | null
  end_time: number | null
  display_time: string
  location: string
  cover_image: string
  target_id: number
  registered_at?: number | null
  created_at?: number | null
  venue_id?: number
  scene_id?: number
  action_text: string
  cancelable?: boolean
}

@Injectable()
export class ProfileService {
  constructor(
    private readonly users: UsersService,
    private readonly posts: PostsService,
    private readonly registrations: EventRegistrationService,
    private readonly demands: DemandsService,
    private readonly demandApps: DemandApplicationService,
    private readonly venues: VenuesService
  ) {}

  async summary(userId: number) {
    const user = await this.users.getCurrentUser(userId)
    const postsRes = await this.posts.listMine(userId, 1, 1)
    const eventsRes = await this.registrations.listByUser(userId)
    const demandsRes = await this.demands.listMine(userId, 1, 1)
    const demandAppsRes = await this.demandApps.listByUser(userId)
    const scheduledDemandsCount = await this.demands.countMineWithApplications(userId)
    const venueBookingsRes = await this.venues.listByUser(userId)
    const eventsCount = (eventsRes.list || []).length
    const demandApplicationsCount = (demandAppsRes.list || []).length
    const venueBookingsCount = (venueBookingsRes.list || []).length
    return {
      user,
      postsCount: postsRes.total,
      eventsCount,
      demandsCount: demandsRes.total,
      demandApplicationsCount,
      participationCount: eventsCount + demandApplicationsCount + scheduledDemandsCount + venueBookingsCount,
      venueBookingsCount
    }
  }

  async myBookings(userId: number) {
    const [eventsRes, venuesRes, demandsRes, demandAppsRes] = await Promise.all([
      this.registrations.listByUser(userId),
      this.venues.listByUser(userId),
      this.demands.listMine(userId, 1, 100),
      this.demandApps.listByUser(userId)
    ])

    const eventItems: MyBookingListItem[] = (eventsRes.list || []).map((item: any) => ({
      id: `event-${item.id}`,
      biz_type: 'event_registration',
      title: item.title || '活动报名',
      subtitle: item.organizer || '官方活动',
      status: item.statusText || '',
      start_time: item.startTime || null,
      end_time: item.endTime || null,
      display_time: item.time || '',
      location: item.location || '',
      cover_image: item.coverUrl || '',
      target_id: Number(item.id),
      registered_at: item.registeredAt || null,
      action_text: '查看活动详情',
      cancelable: false
    }))

    const createdDemandItems: MyBookingListItem[] = (demandsRes.list || [])
      .filter((item: any) => item.application_count === undefined || Number(item.application_count || 0) > 0)
      .map((item: any) => ({
        id: `demand-created-${item.id}`,
        biz_type: 'demand_created',
        title: item.title || '我发起的邀约',
        subtitle:
          item.schedule_status_text ||
          (Number(item.application_count || 0) > 0
            ? `已有 ${item.application_count} 人报名`
            : item.status === 'CLOSED' || item.status === 'CANCELLED'
              ? '已结束'
              : '招募中'),
        status: item.schedule_status_text || '',
        start_time: item.event_time || null,
        end_time: null,
        display_time: item.event_time ? new Date(item.event_time).toLocaleString('zh-CN', { hour12: false }) : '时间待定',
        location: item.location || item.city || '地点待定',
        cover_image: '',
        target_id: Number(item.id),
        created_at: item.created_at || null,
        action_text: '查看需求详情',
        cancelable: false
      }))

    const appliedDemandItems: MyBookingListItem[] = (demandAppsRes.list || []).map((item: any) => ({
      id: `demand-applied-${item.id}`,
      biz_type: 'demand_applied',
      title: item.title || '我报名的邀约',
      subtitle: item.schedule_status_text || item.status_text || '待沟通',
      status: item.schedule_status_text || '',
      start_time: item.event_time || null,
      end_time: null,
      display_time: item.event_time ? new Date(item.event_time).toLocaleString('zh-CN', { hour12: false }) : '时间待定',
      location: item.location || item.city || '地点待定',
      cover_image: '',
      target_id: Number(item.id),
      registered_at: item.applied_at || item.created_at || null,
      action_text: '查看需求详情',
      cancelable: false
    }))

    const venueItems: MyBookingListItem[] = (venuesRes.list || []).map((item: any) => ({
      id: `venue-${item.id}`,
      biz_type: 'venue_booking',
      title: item.scene_name ? `${item.venue_name} · ${item.scene_name}` : item.venue_name || '场地预约',
      subtitle: item.venue_address || item.venue_city || '场地预约',
      status: item.status === 'CONFIRMED' ? '预约成功' : item.status || '',
      start_time: item.start_time || null,
      end_time: item.end_time || null,
      display_time:
        item.start_time && item.end_time
          ? `${new Date(item.start_time).toLocaleString('zh-CN', { hour12: false })} - ${new Date(item.end_time).toLocaleString('zh-CN', { hour12: false })}`
          : '',
      location: item.venue_address || item.venue_city || '',
      cover_image: item.scene_image_url || item.venue_cover_image || '',
      target_id: Number(item.id),
      venue_id: item.venue_id,
      scene_id: item.scene_id,
      created_at: item.created_at || null,
      action_text: '查看场地预约',
      cancelable: item.status === 'CONFIRMED' && Number(item.start_time || 0) > Date.now()
    }))

    const list = [...eventItems, ...createdDemandItems, ...appliedDemandItems, ...venueItems].sort((a, b) => {
      const aTime = Number(a.start_time || a.registered_at || a.created_at || 0)
      const bTime = Number(b.start_time || b.registered_at || b.created_at || 0)
      return bTime - aTime
    })

    return {
      list,
      total: list.length
    }
  }
}
