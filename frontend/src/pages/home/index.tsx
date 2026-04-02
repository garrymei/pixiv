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

  const handleBannerClick = (url?: string) => {
    if (url) Taro.navigateTo({ url })
  }

  const handleEntryClick = (url?: string) => {
    if (url) Taro.navigateTo({ url })
  }

  const handlePostClick = (id: string) => Taro.navigateTo({ url: `/pages/post-detail/index?id=${id}` })
  const handleDemandClick = (id: string) => Taro.navigateTo({ url: `/pages/demand-detail/index?id=${id}` })

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
    <View className="page-home page-container">
      <HeroBanner
        title={banners[0]?.title}
        subtitle={banners[0]?.subtitle}
        backgroundImage={banners[0]?.imageUrl}
        ctaText="查看详情"
        onCtaClick={() => handleBannerClick(banners[0]?.linkUrl)}
      />

      <View className="page-home__content">
        <QuickEntryGrid items={QUICK_ENTRIES} onItemClick={(item) => handleEntryClick(item.url)} />

        <View className="page-home__tabs">
          {TABS.map((tab) => (
            <View
              key={tab.id}
              className={classNames('page-home__tab', {
                'page-home__tab--active': activeTab === tab.id
              })}
              onClick={() => setActiveTab(tab.id)}
            >
              <Text>{tab.label}</Text>
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

        {renderContent()}
      </View>
    </View>
  )
}
