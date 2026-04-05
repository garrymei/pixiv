import { View, Text } from '@tarojs/components'
import { useCallback, useEffect, useRef, useState } from 'react'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import classNames from 'classnames'

import { HeroBanner } from '../../components/business/HeroBanner'
import { QuickEntryGrid } from '../../components/business/QuickEntryGrid'
import { PostCard } from '../../components/business/PostCard'
import { DemandCard } from '../../components/business/DemandCard'
import { EmptyState } from '../../components/base/EmptyState'
import { LoadingState } from '../../components/base/LoadingState'
import { SectionHeader } from '../../components/base/SectionHeader'

import { listBanners } from '../../services/banners'
import { consumePostListShouldRefresh, listPosts } from '../../services/posts'
import { consumeDemandListShouldRefresh, listDemands } from '../../services/demands'

import './index.scss'

const TABS = [
  { id: 'recommend', label: '推荐' },
  { id: 'cosplay', label: '正片' },
  { id: 'daily', label: '日常' },
  { id: 'demand', label: '招募' }
]

const DEMAND_FILTERS = ['全部', '摄影', '妆娘', 'Coser', '后期']
const TAB_BAR_PAGES = new Set([
  '/pages/home/index',
  '/pages/discover/index',
  '/pages/publish/index',
  '/pages/events/index',
  '/pages/profile/index'
])

const TAB_COPY: Record<string, { title: string; description: string; tag: string }> = {
  recommend: {
    title: '推荐情报站',
    description: '追踪湾区同好热帖、活动返图和正在发光的创作者。',
    tag: '热度上升'
  },
  cosplay: {
    title: '高光正片区',
    description: '把最有氛围感的角色作品放进首屏，让灵感一打开就扑面而来。',
    tag: '正片精选'
  },
  daily: {
    title: '日常营业中',
    description: '逛展、化妆、做道具、碎碎念，真实社区感都藏在这些日常里。',
    tag: '轻松围观'
  },
  demand: {
    title: '协作招募墙',
    description: '找摄影、约妆造、组外拍搭子，让灵感快速找到同频伙伴。',
    tag: '立即组队'
  }
}

const QUICK_ENTRIES = [
  { id: 'q_1', title: '漫展资讯', icon: '📅', url: '/pages/events/index' },
  { id: 'q_2', title: '找CP/扩列', icon: '🤝', url: '/pages/discover/index' },
  { id: 'q_3', title: '求妆娘', icon: '💄', url: '/pages/publish-demand/index' },
  { id: 'q_4', title: '摄影接单', icon: '📷', url: '/pages/publish-demand/index' }
]

export default function Home() {
  const [activeTab, setActiveTab] = useState('recommend')
  const [activeDemandType, setActiveDemandType] = useState('全部')
  const [banners, setBanners] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [demands, setDemands] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const hasLoadedRef = useRef(false)

  const loadData = useCallback(async (tab = activeTab) => {
    setIsLoading(true)
    setError('')
    try {
      const postType = tab === 'cosplay' ? 'work' : tab === 'daily' ? 'daily' : undefined
      const demandType = activeDemandType === '全部' ? undefined : activeDemandType
      const [bs, content] = await Promise.all([
        listBanners(),
        tab === 'demand' ? listDemands(demandType) : listPosts(postType)
      ])
      setBanners(bs)
      if (tab === 'demand') {
        setDemands(content)
        setPosts([])
      } else {
        setPosts(content)
        setDemands([])
      }
      hasLoadedRef.current = true
    } catch (err: any) {
      setError(err?.message || '首页加载失败')
    } finally {
      setIsLoading(false)
      Taro.stopPullDownRefresh()
    }
  }, [activeDemandType, activeTab])

  useEffect(() => {
    if (!hasLoadedRef.current) return
    loadData(activeTab)
  }, [loadData])

  useDidShow(() => {
    if (!hasLoadedRef.current || consumePostListShouldRefresh() || consumeDemandListShouldRefresh()) {
      loadData(activeTab)
    }
  })

  usePullDownRefresh(() => {
    loadData(activeTab)
  })

  const normalizeUrl = (url?: string) => {
    if (!url) return ''
    return url === '/pages/explore/index' ? '/pages/discover/index' : url
  }

  const navigateByUrl = (rawUrl?: string) => {
    const url = normalizeUrl(rawUrl)
    if (!url) return

    if (TAB_BAR_PAGES.has(url)) {
      Taro.switchTab({ url })
      return
    }

    Taro.navigateTo({ url })
  }

  const handleBannerClick = (url?: string) => {
    navigateByUrl(url)
  }

  const handleEntryClick = (url?: string) => {
    navigateByUrl(url)
  }

  const handlePostClick = (id: string) => Taro.navigateTo({ url: `/pages/post-detail/index?id=${id}` })
  const handleDemandClick = (id: string) => Taro.navigateTo({ url: `/pages/demand-detail/index?id=${id}` })
  const activeTabCopy = TAB_COPY[activeTab]
  const currentCount = activeTab === 'demand' ? demands.length : posts.length
  const heroStats = [
    { label: '首页焦点', value: `${banners.length || 0}`, tone: 'primary' },
    { label: '当前内容', value: `${currentCount || 0}`, tone: 'secondary' },
    { label: '招募类型', value: `${DEMAND_FILTERS.length - 1}`, tone: 'tertiary' }
  ]

  const renderContent = () => {
    if (isLoading) return <LoadingState text="首页加载中..." />
    if (error) return <EmptyState title="加载失败" description={error} actionText="重试" onAction={loadData} />

    if (activeTab === 'demand') {
      if (demands.length === 0) return <EmptyState title="暂无招募需求" />
      return (
        <View className="page-home__demands">
          {demands.map((demand) => (
            <DemandCard
              key={demand.id}
              className="page-home__demand-card"
              type={demand.type}
              title={demand.title}
              budget={demand.budget}
              location={demand.location}
              time={demand.time}
              authorName={demand.authorName}
              authorAvatar={demand.authorAvatar}
              status={demand.status}
              onClick={() => handleDemandClick(demand.id)}
              onActionClick={() => handleDemandClick(demand.id)}
            />
          ))}
        </View>
      )
    }

    if (posts.length === 0) return <EmptyState title="暂无内容" />

    const leftCol = posts.filter((_, index) => index % 2 === 0)
    const rightCol = posts.filter((_, index) => index % 2 !== 0)

    return (
      <View className="page-home__waterfall">
        <View className="page-home__waterfall-col">
          {leftCol.map((post) => (
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
          {rightCol.map((post) => (
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
    )
  }

  return (
    <View className="page-home page-container-full">
      <View className="page-home__hero-shell">
        <View className="page-home__hero-topbar">
          <View className="page-home__hero-copy">
            <Text className="page-home__eyebrow">YUE CI YUAN JUN</Text>
            <Text className="page-home__headline">年轻同好聚集地，灵感和伙伴一起上线。</Text>
            <Text className="page-home__subheadline">在湾区刷到新鲜正片、活动资讯和招募合作，让每次打开都有点热闹。</Text>
          </View>
          <View className="page-home__hero-badge">
            <Text className="page-home__hero-badge-text">湾区次元 LIVE</Text>
          </View>
        </View>

        <HeroBanner
          className="page-home__hero-banner"
          title={banners[0]?.title || '今日焦点活动'}
          subtitle={banners[0]?.subtitle || '刷热帖、逛活动、找搭子，一页点亮同频灵感。'}
          backgroundImage={banners[0]?.imageUrl}
          ctaText="立即围观"
          onClick={() => handleBannerClick(banners[0]?.linkUrl)}
          onCtaClick={() => handleBannerClick(banners[0]?.linkUrl)}
        />

        <View className="page-home__hero-stats">
          {heroStats.map((item) => (
            <View key={item.label} className={`page-home__stat-card page-home__stat-card--${item.tone}`}>
              <Text className="page-home__stat-label">{item.label}</Text>
              <Text className="page-home__stat-value">{item.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="page-home__content">
        <View className="page-home__intro-card">
          <View className="page-home__intro-main">
            <Text className="page-home__intro-title">先看内容，再找搭子，再去现场。</Text>
            <Text className="page-home__intro-desc">首页保持“作品、日常、活动、招募”四线并行，让第一次打开就有二次元社区该有的热度和生命力。</Text>
          </View>
          <View className="page-home__intro-tags">
            <Text className="page-home__intro-tag"># 同城扩列</Text>
            <Text className="page-home__intro-tag"># 外拍合作</Text>
            <Text className="page-home__intro-tag"># 漫展情报</Text>
          </View>
        </View>

        <SectionHeader
          title="次元快捷入口"
          actionText="查看活动"
          onAction={() => handleEntryClick('/pages/events/index')}
        />
        <QuickEntryGrid
          className="page-home__quick-grid"
          items={QUICK_ENTRIES}
          onItemClick={(item) => handleEntryClick(item.url)}
        />

        <View className="page-home__feed-panel">
          <View className="page-home__panel-header">
            <View className="page-home__panel-copy">
              <Text className="page-home__panel-title">{activeTabCopy.title}</Text>
              <Text className="page-home__panel-desc">{activeTabCopy.description}</Text>
            </View>
            <View className="page-home__panel-chip">
              <Text>{activeTabCopy.tag}</Text>
            </View>
          </View>

          <View className="page-home__tabs">
            {TABS.map((tab) => (
              <View
                key={tab.id}
                className={classNames('page-home__tab', {
                  'page-home__tab--active': activeTab === tab.id
                })}
                onClick={() => setActiveTab(tab.id)}
              >
                <Text className="page-home__tab-text">{tab.label}</Text>
              </View>
            ))}
          </View>

          {activeTab === 'demand' && (
            <View className="page-home__filters">
              {DEMAND_FILTERS.map((type) => (
                <View
                  key={type}
                  className={classNames('page-home__filter', {
                    'page-home__filter--active': activeDemandType === type
                  })}
                  onClick={() => setActiveDemandType(type)}
                >
                  <Text>{type}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {renderContent()}
      </View>
    </View>
  )
}
