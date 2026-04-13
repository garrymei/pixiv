import { View, Text } from '@tarojs/components'
import { useEffect, useMemo, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import classNames from 'classnames'

import { Input } from '../../components/base/Input'
import { Tag } from '../../components/base/Tag'
import { PostCard } from '../../components/business/PostCard'
import { DemandCard } from '../../components/business/DemandCard'
import { EmptyState } from '../../components/base/EmptyState'

import { listPosts } from '../../services/posts'
import { listDemands } from '../../services/demands'
import { getApiBaseUrl } from '../../services/request'
import { mockPosts } from '../../mocks/posts'
import { mockDemands } from '../../mocks/demands'

import './index.scss'

const TABS = [
  { id: 'square', label: '动态广场' },
  { id: 'market', label: '次元市集' }
]

const MARKET_MAIN_FILTERS = [
  { id: 'seek', label: '我来找你' },
  { id: 'offer', label: '我行我上' }
]

const MARKET_SUB_FILTERS = {
  seek: ['全部', '找毛娘', '找妆娘', '找摄影', '其他'],
  offer: ['全部', '本毛娘', '本妆娘', '本摄影', '其他']
}

export default function Discover() {
  const [activeTab, setActiveTab] = useState('square')
  const apiBaseUrl = getApiBaseUrl()
  
  // 广场状态
  const [search, setSearch] = useState('')
  const [posts, setPosts] = useState<any[]>([])
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [isSquareMockFallback, setIsSquareMockFallback] = useState(false)
  
  // 市集状态
  const [demands, setDemands] = useState<any[]>([])
  const [activeMarketMain, setActiveMarketMain] = useState<'seek'|'offer'>('seek')
  const [activeMarketSub, setActiveMarketSub] = useState('全部')
  const [isMarketMockFallback, setIsMarketMockFallback] = useState(false)

  // 根据主筛选，生成展示用的类型标签（如：找摄影 / 本摄影）
  const formatDisplayType = (main: 'seek' | 'offer', rawType: string) => {
    if (!rawType) return rawType
    // 如果后端/Mock 已经带了前缀，则直接返回
    if (/^(找|本)/.test(rawType)) return rawType
    const prefix = main === 'seek' ? '找' : '本'
    return `${prefix}${rawType}`
  }

  const mapMarketFilterToDemandType = (main: 'seek' | 'offer', sub: string) => {
    if (sub === '全部') return undefined
    const normalized = sub.replace(/^(找|本)/, '')
    if (normalized === '摄影') return '摄影'
    if (normalized === '妆娘' || normalized === '毛娘') return '妆娘'
    if (normalized.toLowerCase() === 'coser') return 'Coser'
    if (normalized === '后期') return '后期'
    if (main === 'seek') return '其他'
    if (main === 'offer') return '其他'
    return undefined
  }

  // 获取数据
  const loadData = async () => {
    try {
      if (activeTab === 'square') {
        const p = await listPosts()
        if (Array.isArray(p) && p.length > 0) {
          setPosts(p)
          setIsSquareMockFallback(false)
          return
        }

        setPosts(mockPosts)
        setIsSquareMockFallback(true)
      } else {
        const type = mapMarketFilterToDemandType(activeMarketMain, activeMarketSub)
        const d = await listDemands(type)
        if (Array.isArray(d) && d.length > 0) {
          setDemands(d)
          setIsMarketMockFallback(false)
          return
        }

        const fallback = type ? mockDemands.filter((item) => item.type === type) : mockDemands
        setDemands(fallback)
        setIsMarketMockFallback(true)
      }
    } catch (err: any) {
      console.error('Discover loadData error:', err)
      if (activeTab === 'square') {
        setPosts(mockPosts)
        setIsSquareMockFallback(true)
      } else {
        const type = mapMarketFilterToDemandType(activeMarketMain, activeMarketSub)
        setDemands(type ? mockDemands.filter((item) => item.type === type) : mockDemands)
        setIsMarketMockFallback(true)
      }
      Taro.showToast({ title: '接口异常，已切换示例数据', icon: 'none' })
    }
  }

  useEffect(() => {
    loadData()
  }, [activeTab, activeMarketSub, activeMarketMain])

  useDidShow(() => {
    // 避免首次加载时和 useEffect 冲突，只在需要刷新时拉取数据
    if (activeTab === 'square') {
      const { consumePostListShouldRefresh } = require('../../services/posts')
      if (consumePostListShouldRefresh()) loadData()
    } else {
      const { consumeDemandListShouldRefresh } = require('../../services/demands')
      if (consumeDemandListShouldRefresh()) loadData()
    }
  })

  // 当主分类切换时，重置子分类为“全部”
  const handleMainFilterChange = (mainId: 'seek' | 'offer') => {
    if (activeMarketMain !== mainId) {
      setActiveMarketMain(mainId)
      setActiveMarketSub('全部')
    }
  }

  // 广场计算逻辑
  const allTags = useMemo(() => {
    const s = new Set<string>()
    posts.forEach(p => p.tags.forEach((t: string) => s.add(t)))
    return Array.from(s)
  }, [posts])

  const filterPosts = useMemo(() => {
    let list = posts
    if (activeTag) list = list.filter(p => p.tags.includes(activeTag))
    if (search.trim()) list = list.filter(p => p.title.includes(search.trim()))
    return list
  }, [activeTag, search, posts])

  const handlePostClick = (id: string) => Taro.navigateTo({ url: `/pages/post-detail/index?id=${id}` })
  const handleDemandClick = (id: string) => Taro.navigateTo({ url: `/pages/demand-detail/index?id=${id}` })

  return (
    <View className="page-discover page-container-full">
      {/* 顶部 Tab 切换 */}
      <View className="discover-header">
        <View className="discover-tabs">
          {TABS.map(tab => (
            <View
              key={tab.id}
              className={classNames('discover-tab', {
                'discover-tab--active': activeTab === tab.id
              })}
              onClick={() => setActiveTab(tab.id)}
            >
              <Text className="discover-tab__text">{tab.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="discover-content">
        {activeTab === 'square' && (
          <View className="discover-square">
            <View className="discover-search">
              <Input
                value={search}
                onInput={e => setSearch((e.detail as any).value)}
                placeholder="搜索你感兴趣的动态内容"
              />
            </View>
            <View className="discover-source">
              <Text className="discover-source__text">
                读取地址：{apiBaseUrl}
              </Text>
              <Text className={classNames('discover-source__badge', {
                'discover-source__badge--mock': isSquareMockFallback
              })}>
                {isSquareMockFallback ? '当前数据：Mock 示例' : '当前数据：域名接口'}
              </Text>
            </View>

            {allTags.length > 0 && (
              <View className="discover-tags">
                {allTags.map(tag => (
                  <View key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}>
                    <Tag
                      type={activeTag === tag ? 'primary' : 'default'}
                      outline={activeTag !== tag}
                      size="medium"
                    >
                      {tag}
                    </Tag>
                  </View>
                ))}
              </View>
            )}

            <View className="discover-waterfall">
              <View style={{ display: filterPosts.length === 0 ? 'block' : 'none' }}>
                <EmptyState title="广场暂无动态" />
              </View>
              
              <View style={{ display: filterPosts.length > 0 ? 'block' : 'none' }}>
                <View className="discover-waterfall__cols">
                  <View className="discover-waterfall__col">
                    {filterPosts.filter((_, i) => i % 2 === 0).map(p => (
                      <PostCard
                        key={p.id}
                        coverUrl={p.coverUrl}
                        title={p.title}
                        authorName={p.authorName}
                        authorAvatar={p.authorAvatar}
                        likeCount={p.likeCount}
                        commentCount={p.commentCount}
                        tags={p.tags}
                        isWaterfall
                        onClick={() => handlePostClick(p.id)}
                      />
                    ))}
                  </View>
                  <View className="discover-waterfall__col">
                    {filterPosts.filter((_, i) => i % 2 !== 0).map(p => (
                      <PostCard
                        key={p.id}
                        coverUrl={p.coverUrl}
                        title={p.title}
                        authorName={p.authorName}
                        authorAvatar={p.authorAvatar}
                        likeCount={p.likeCount}
                        commentCount={p.commentCount}
                        tags={p.tags}
                        isWaterfall
                        onClick={() => handlePostClick(p.id)}
                      />
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'market' && (
          <View className="discover-market">
            <View className="discover-market__main-filters">
              {MARKET_MAIN_FILTERS.map(mainFilter => (
                <View
                  key={mainFilter.id}
                  className={classNames('discover-market__main-filter', {
                    'discover-market__main-filter--active': activeMarketMain === mainFilter.id
                  })}
                  onClick={() => handleMainFilterChange(mainFilter.id as 'seek' | 'offer')}
                >
                  <Text>{mainFilter.label}</Text>
                </View>
              ))}
            </View>

            <View className="discover-market__filters">
              {MARKET_SUB_FILTERS[activeMarketMain].map(filter => (
                <View
                  key={filter}
                  className={classNames('discover-market__filter', {
                    'discover-market__filter--active': activeMarketSub === filter
                  })}
                  onClick={() => setActiveMarketSub(filter)}
                >
                  <Text>{filter}</Text>
                </View>
              ))}
            </View>

            <View className="discover-market__list">
              <View className="discover-source discover-source--market">
                <Text className="discover-source__text">
                  读取地址：{apiBaseUrl}
                </Text>
                <Text className={classNames('discover-source__badge', {
                  'discover-source__badge--mock': isMarketMockFallback
                })}>
                  {isMarketMockFallback ? '当前数据：Mock 示例' : '当前数据：域名接口'}
                </Text>
              </View>
              <View style={{ display: demands.length === 0 ? 'block' : 'none' }}>
                <EmptyState title="市集暂无内容" />
              </View>
              
              <View style={{ display: demands.length > 0 ? 'block' : 'none' }}>
                {demands.map(demand => (
                  <DemandCard
                    key={demand.id}
                    type={formatDisplayType(activeMarketMain, demand.type)}
                    title={demand.title}
                    budget={demand.budget}
                    location={demand.location}
                    time={demand.time}
                    createTime={demand.createTime}
                    authorName={demand.authorName}
                    authorAvatar={demand.authorAvatar}
                    status={demand.status}
                    onClick={() => handleDemandClick(demand.id)}
                    onActionClick={() => handleDemandClick(demand.id)}
                  />
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}
