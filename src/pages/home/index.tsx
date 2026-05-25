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

const QUICK_ENTRIES = [
  { id: 'q_1', title: '漫展资讯', icon: '📅', url: '/pages/events/index' },
  { id: 'q_2', title: '找CP/扩列', icon: '🤝', url: '/pages/discover/index' }
]

const TAB_BAR_PAGES = new Set([
  '/pages/home/index',
  '/pages/discover/index',
  '/pages/publish-hub/index',
  '/pages/events/index',
  '/pages/profile/index'
])

const DISCOVER_NAVIGATION_INTENT_KEY = 'discover_navigation_intent'

const MUTUAL_HELP_TABS = [
  { id: 'seek', label: '我来找你' },
  { id: 'offer', label: '我行我上' }
] as const

const MUTUAL_HELP_ITEMS: Record<'seek' | 'offer', Array<{ id: string; title: string; icon: string; marketMain: 'seek' | 'offer'; marketSub: string }>> = {
  seek: [
    { id: 'seek_1', title: '找毛娘', icon: '✂️', marketMain: 'seek', marketSub: '找毛娘' },
    { id: 'seek_2', title: '找妆娘', icon: '💄', marketMain: 'seek', marketSub: '找妆娘' },
    { id: 'seek_3', title: '找摄影', icon: '📷', marketMain: 'seek', marketSub: '找摄影' }
  ],
  offer: [
    { id: 'offer_1', title: '本毛娘', icon: '✨', marketMain: 'offer', marketSub: '本毛娘' },
    { id: 'offer_2', title: '本妆娘', icon: '💅', marketMain: 'offer', marketSub: '本妆娘' },
    { id: 'offer_3', title: '本摄影', icon: '📸', marketMain: 'offer', marketSub: '本摄影' }
  ]
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

  const handleEntryClick = (url?: string) => {
    openPage(url)
  }

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
    if (linkUrl.startsWith('/pages/')) {
      openPage(linkUrl)
      return
    }
  }, [openPage])

  const loadData = useCallback(async () => {
    try {
      const [postsRes, bannersRes] = await Promise.all([
        listPosts(),
        listBanners().catch(() => [])
      ])
      const sortedPosts = [...postsRes]
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
        <View className="page-home__hero-topbar">
          <View className="page-home__hero-copy">
            <Text className="page-home__eyebrow">YUE CI YUAN JUN</Text>
            <Text className="page-home__headline">粤次元君</Text>
            <Text className="page-home__subheadline">发现湾区同好，连接热爱与创作。</Text>
          </View>
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
          title="次元快捷入口"
          actionText="查看全部"
          onAction={() => handleEntryClick('/pages/events/index')}
        />
        <QuickEntryGrid
          className="page-home__quick-grid"
          items={QUICK_ENTRIES}
          onItemClick={(item) => handleEntryClick(item.url)}
        />

        <View className="page-home__mutual-help">
          <View className="page-home__mutual-header">
            <Text className="page-home__mutual-title">次元互帮互助</Text>
            <View className="page-home__mutual-tabs">
              {MUTUAL_HELP_TABS.map(tab => (
                <View
                  key={tab.id}
                  className={classNames('page-home__mutual-tab', {
                    'page-home__mutual-tab--active': mutualHelpTab === tab.id
                  })}
                  onClick={() => setMutualHelpTab(tab.id as 'seek' | 'offer')}
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
                <View className="page-home__mutual-icon">{item.icon}</View>
                <Text className="page-home__mutual-text">{item.title}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="page-home__feed-panel">
          <View className="page-home__panel-header">
            <View className="page-home__panel-copy">
              <Text className="page-home__panel-title">一周热帖</Text>
              <Text className="page-home__panel-desc">最近一周最受欢迎的同好动态</Text>
            </View>
            <View className="page-home__panel-chip">🔥 最新</View>
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
