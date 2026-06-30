import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classNames from 'classnames'
import { useCallback, useEffect, useState } from 'react'

import { SectionHeader } from '../../components/base/SectionHeader'
import { QuickEntryGrid } from '../../components/business/QuickEntryGrid'
import { PostCard } from '../../components/business/PostCard'
import { HeroBanner } from '../../components/business/HeroBanner'
import { listBanners } from '../../services/banners'
import { listPosts } from '../../services/posts'
import { useThemeMode } from '../../config/theme'

import './index.scss'

type MutualIconType = 'wig' | 'makeup' | 'camera'

const QUICK_ENTRIES = [
  { id: 'events', title: '漫展活动', iconType: 'calendar' as const, url: '/pages/events/index' },
  { id: 'market', title: '合作市集', iconType: 'handshake' as const, url: '/pages/discover/index' },
  { id: 'venues', title: '场地预约', icon: '场', url: '/pages/venues/index' }
]

const TAB_BAR_PAGES = new Set([
  '/pages/home/index',
  '/pages/discover/index',
  '/pages/publish-hub/index',
  '/pages/events/index',
  '/pages/profile/index'
])

const DISCOVER_NAVIGATION_INTENT_KEY = 'discover_navigation_intent'

function getCurrentWeekStart() {
  const now = new Date()
  const currentDay = now.getDay()
  const diff = currentDay === 0 ? 6 : currentDay - 1
  const start = new Date(now)
  start.setDate(now.getDate() - diff)
  start.setHours(0, 0, 0, 0)
  return start.getTime()
}

const MUTUAL_HELP_TABS = [
  { id: 'seek', label: '我来找你' },
  { id: 'offer', label: '我能提供' }
] as const

const MUTUAL_HELP_ITEMS: Record<'seek' | 'offer', Array<{ id: string; title: string; iconType: MutualIconType; marketMain: 'seek' | 'offer'; marketSub: string }>> = {
  seek: [
    { id: 'seek_wig', title: '找毛娘', iconType: 'wig', marketMain: 'seek', marketSub: '找毛娘' },
    { id: 'seek_makeup', title: '找妆娘', iconType: 'makeup', marketMain: 'seek', marketSub: '找妆娘' },
    { id: 'seek_photo', title: '找摄影', iconType: 'camera', marketMain: 'seek', marketSub: '找摄影' }
  ],
  offer: [
    { id: 'offer_wig', title: '接毛娘', iconType: 'wig', marketMain: 'offer', marketSub: '接毛娘' },
    { id: 'offer_makeup', title: '接妆娘', iconType: 'makeup', marketMain: 'offer', marketSub: '接妆娘' },
    { id: 'offer_photo', title: '接摄影', iconType: 'camera', marketMain: 'offer', marketSub: '接摄影' }
  ]
}

function MutualIcon({ type }: { type: MutualIconType }) {
  return (
    <View className={classNames('page-home__mutual-icon-graphic', `page-home__mutual-icon-graphic--${type}`)}>
      <View className="page-home__mutual-icon-line page-home__mutual-icon-line--a" />
      <View className="page-home__mutual-icon-line page-home__mutual-icon-line--b" />
      <View className="page-home__mutual-icon-line page-home__mutual-icon-line--c" />
    </View>
  )
}

export default function Home() {
  const [mutualHelpTab, setMutualHelpTab] = useState<'seek'|'offer'>('seek')
  const [feedPosts, setFeedPosts] = useState<any[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const { theme } = useThemeMode()

  const openPage = useCallback((url?: string) => {
    if (!url) return
    if (TAB_BAR_PAGES.has(url)) {
      Taro.switchTab({ url })
      return
    }
    Taro.navigateTo({ url })
  }, [])

  const handleMutualHelpClick = (marketMain: 'seek' | 'offer', marketSub: string) => {
    Taro.setStorageSync(DISCOVER_NAVIGATION_INTENT_KEY, {
      activeTab: 'market',
      marketMain,
      marketSub
    })
    Taro.switchTab({ url: '/pages/discover/index' })
  }

  const handlePostClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/post-detail/index?id=${id}` })
  }

  const handleBannerClick = useCallback((linkUrl?: string) => {
    if (!linkUrl) return
    if (linkUrl.startsWith('/pages/')) openPage(linkUrl)
  }, [openPage])

  const loadData = useCallback(async () => {
    try {
      const [postsRes, bannersRes] = await Promise.all([
        listPosts(),
        listBanners().catch(() => [])
      ])
      const currentWeekStart = getCurrentWeekStart()
      const weeklyPosts = postsRes.filter((post) => (post.createdAt || 0) >= currentWeekStart)
      const visiblePosts = weeklyPosts.length > 0 ? weeklyPosts : postsRes
      const sortedPosts = [...visiblePosts]
        .sort((a, b) => {
          const scoreDiff = (b.hotScore || 0) - (a.hotScore || 0)
          if (scoreDiff !== 0) return scoreDiff
          return (b.createdAt || 0) - (a.createdAt || 0)
        })
        .slice(0, 8)
      setFeedPosts(sortedPosts)
      setBanners(bannersRes || [])
    } catch (error: any) {
      Taro.showToast({ title: error?.message || '首页加载失败', icon: 'none' })
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const leftCol = feedPosts.filter((_, i) => i % 2 === 0)
  const rightCol = feedPosts.filter((_, i) => i % 2 === 1)

  return (
    <View className={classNames('page-home', `theme-${theme}`)}>
      <View className="page-home__hero-shell">
        <View className="page-home__hero-copy">
          <Text className="page-home__eyebrow">JIU JIANG CI YUAN QU</Text>
          <Text className="page-home__headline">就酱次元区</Text>
          <Text className="page-home__subheadline">发现同城同好，连接创作、活动与合作。</Text>
        </View>
        <View className="page-home__hero-badge">
          <Text className="page-home__hero-badge-text">社区 Beta</Text>
        </View>
      </View>

      <View className="page-home__content">
        {banners[0] ? (
          <HeroBanner
            className="page-home__banner"
            title={banners[0].title}
            subtitle={banners[0].subtitle}
            backgroundImage={banners[0].imageUrl}
            ctaText={banners[0].linkUrl ? '查看详情' : undefined}
            onCtaClick={banners[0].linkUrl ? () => handleBannerClick(banners[0].linkUrl) : undefined}
            onClick={() => handleBannerClick(banners[0].linkUrl)}
          />
        ) : null}

        <SectionHeader
          title="快捷入口"
          actionText="全部"
          onAction={() => openPage('/pages/discover/index')}
        />
        <QuickEntryGrid
          className="page-home__quick-grid"
          items={QUICK_ENTRIES}
          onItemClick={(item) => openPage(item.url)}
        />

        <View className="page-home__mutual-help">
          <View className="page-home__mutual-header">
            <View>
              <Text className="page-home__mutual-title">合作互助</Text>
              <Text className="page-home__mutual-desc">按角色快速进入市集筛选</Text>
            </View>
            <View className="page-home__mutual-tabs">
              {MUTUAL_HELP_TABS.map(tab => (
                <View
                  key={tab.id}
                  className={classNames('page-home__mutual-tab', {
                    'page-home__mutual-tab--active': mutualHelpTab === tab.id
                  })}
                  onClick={() => setMutualHelpTab(tab.id)}
                >
                  <Text>{tab.label}</Text>
                </View>
              ))}
            </View>
          </View>
          <View className="page-home__mutual-content">
            {MUTUAL_HELP_ITEMS[mutualHelpTab].map(item => (
              <View
                key={item.id}
                className="page-home__mutual-item"
                onClick={() => handleMutualHelpClick(item.marketMain, item.marketSub)}
              >
                <View className="page-home__mutual-icon">
                  <MutualIcon type={item.iconType} />
                </View>
                <Text className="page-home__mutual-text">{item.title}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="page-home__feed-panel">
          <View className="page-home__panel-header">
            <View className="page-home__panel-copy">
              <Text className="page-home__panel-title">本周热帖</Text>
              <Text className="page-home__panel-desc">最近更受欢迎的同好动态</Text>
            </View>
            <View className="page-home__panel-chip">热门</View>
          </View>

          <View className="page-home__waterfall">
            <View className="page-home__waterfall-col">
              {leftCol.map(post => (
                <PostCard
                  key={post.id}
                  className="page-home__post-card"
                  coverUrl={post.coverUrl}
                  title={post.title}
                  authorName={post.authorName}
                  authorAvatar={post.authorAvatar}
                  likeCount={post.likeCount}
                  commentCount={post.commentCount}
                  tags={post.tags}
                  isWaterfall
                  onClick={() => handlePostClick(post.id)}
                />
              ))}
            </View>
            <View className="page-home__waterfall-col">
              {rightCol.map(post => (
                <PostCard
                  key={post.id}
                  className="page-home__post-card"
                  coverUrl={post.coverUrl}
                  title={post.title}
                  authorName={post.authorName}
                  authorAvatar={post.authorAvatar}
                  likeCount={post.likeCount}
                  commentCount={post.commentCount}
                  tags={post.tags}
                  isWaterfall
                  onClick={() => handlePostClick(post.id)}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}
