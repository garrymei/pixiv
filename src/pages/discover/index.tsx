import { View, Text, ScrollView } from '@tarojs/components'
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
import { useThemeMode } from '../../config/theme'

import './index.scss'

const DISCOVER_NAVIGATION_INTENT_KEY = 'discover_navigation_intent'

const TABS = [
  { id: 'square', label: '动态广场' },
  { id: 'market', label: '合作市集' }
]

const SQUARE_SORT_FILTERS = [
  { id: 'hot', label: '热门' },
  { id: 'latest', label: '最新' }
] as const

const MARKET_MAIN_FILTERS = [
  { id: 'seek', label: '我来找你' },
  { id: 'offer', label: '我能提供' }
]

const MARKET_SUB_FILTERS = {
  seek: ['全部', '找毛娘', '找妆娘', '找摄影', '其他'],
  offer: ['全部', '接毛娘', '接妆娘', '接摄影', '其他']
}

export default function Discover() {
  const [activeTab, setActiveTab] = useState('square')
  const { theme } = useThemeMode()
  const [search, setSearch] = useState('')
  const [posts, setPosts] = useState<any[]>([])
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [activeSort, setActiveSort] = useState<'hot' | 'latest' | null>('hot')
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false)
  const [demands, setDemands] = useState<any[]>([])
  const [activeMarketMain, setActiveMarketMain] = useState<'seek'|'offer'>('seek')
  const [activeMarketSub, setActiveMarketSub] = useState('全部')

  const normalizeMarketType = (rawType: string) => {
    const normalized = String(rawType || '').replace(/^(找|接)/, '')
    if (normalized === '摄影') return '摄影'
    if (normalized === '妆娘') return '妆娘'
    if (normalized === '毛娘') return '毛娘'
    return '其他'
  }

  const formatDisplayType = (main: 'seek' | 'offer', rawType: string) => {
    if (!rawType) return rawType
    const normalized = normalizeMarketType(rawType)
    if (normalized === '其他') return '其他'
    const prefix = main === 'seek' ? '找' : '接'
    return `${prefix}${normalized}`
  }

  const mapMarketFilterToDemandType = (_main: 'seek' | 'offer', sub: string) => {
    if (sub === '全部') return undefined
    const normalized = sub.replace(/^(找|接)/, '')
    if (normalized === '摄影') return '摄影'
    if (normalized === '妆娘') return '妆娘'
    if (normalized === '毛娘') return '毛娘'
    if (normalized === '其他') return '其他'
    return undefined
  }

  const consumeNavigationIntent = () => {
    const next = Taro.getStorageSync(DISCOVER_NAVIGATION_INTENT_KEY) as
      | {
          activeTab?: 'square' | 'market'
          marketMain?: 'seek' | 'offer'
          marketSub?: string
        }
      | ''

    if (!next) return false
    Taro.removeStorageSync(DISCOVER_NAVIGATION_INTENT_KEY)

    if (next.activeTab === 'market') setActiveTab('market')
    if (next.marketMain === 'seek' || next.marketMain === 'offer') setActiveMarketMain(next.marketMain)
    if (next.marketSub) setActiveMarketSub(next.marketSub)
    else if (next.marketMain === 'seek' || next.marketMain === 'offer') setActiveMarketSub('全部')

    return true
  }

  const loadData = async () => {
    try {
      if (activeTab === 'square') {
        const p = await listPosts()
        setPosts(Array.isArray(p) ? p : [])
      } else {
        const type = mapMarketFilterToDemandType(activeMarketMain, activeMarketSub)
        const d = await listDemands(type)
        setDemands(Array.isArray(d) ? d : [])
      }
    } catch (err: any) {
      console.error('Discover loadData error:', err)
      if (activeTab === 'square') setPosts([])
      else setDemands([])
      Taro.showToast({ title: err?.message || '加载失败，请稍后重试', icon: 'none' })
    }
  }

  useEffect(() => {
    loadData()
  }, [activeTab, activeMarketSub, activeMarketMain])

  useDidShow(() => {
    const appliedIntent = consumeNavigationIntent()
    if (appliedIntent) return

    if (activeTab === 'square') {
      const { consumePostListShouldRefresh } = require('../../services/posts')
      if (consumePostListShouldRefresh()) loadData()
    } else {
      const { consumeDemandListShouldRefresh } = require('../../services/demands')
      if (consumeDemandListShouldRefresh()) loadData()
    }
  })

  const handleMainFilterChange = (mainId: 'seek' | 'offer') => {
    if (activeMarketMain !== mainId) {
      setActiveMarketMain(mainId)
      setActiveMarketSub('全部')
    }
  }

  const handleMarketSubFilterClick = (filter: string) => {
    setActiveMarketSub((prev) => (prev === filter || filter === '全部' ? '全部' : filter))
  }

  const handleSortFilterClick = (sortId: 'hot' | 'latest') => {
    setActiveSort((prev) => (prev === sortId ? null : sortId))
  }

  const handleTagFilterClick = (tag: string) => {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]))
  }

  const clearTagFilters = () => {
    setActiveTags([])
  }

  const allTags = useMemo(() => {
    const s = new Set<string>()
    posts.forEach(p => (p.tags || []).forEach((t: string) => s.add(t)))
    return Array.from(s)
  }, [posts])

  const currentWeekStart = useMemo(() => {
    const now = new Date()
    const currentDay = now.getDay()
    const diff = currentDay === 0 ? 6 : currentDay - 1
    const start = new Date(now)
    start.setDate(now.getDate() - diff)
    start.setHours(0, 0, 0, 0)
    return start.getTime()
  }, [])

  const resolvePostCreatedAt = (post: any) => {
    if (typeof post.createdAt === 'number') return post.createdAt
    const parsed = new Date(post.createTime).getTime()
    return Number.isNaN(parsed) ? 0 : parsed
  }

  const filterPosts = useMemo(() => {
    let list = [...posts]
    if (activeTags.length > 0) {
      list = list.filter((p) => activeTags.every((tag) => (p.tags || []).includes(tag)))
    }
    if (search.trim()) list = list.filter(p => String(p.title || '').includes(search.trim()))
    if (activeSort === 'hot') {
      list = list
        .filter((p) => resolvePostCreatedAt(p) >= currentWeekStart)
        .sort((a, b) => {
          if ((b.likeCount || 0) !== (a.likeCount || 0)) return (b.likeCount || 0) - (a.likeCount || 0)
          if ((b.commentCount || 0) !== (a.commentCount || 0)) return (b.commentCount || 0) - (a.commentCount || 0)
          return resolvePostCreatedAt(b) - resolvePostCreatedAt(a)
        })
    } else if (activeSort === 'latest') {
      list = list.sort((a, b) => resolvePostCreatedAt(b) - resolvePostCreatedAt(a))
    }
    return list
  }, [activeSort, activeTags, currentWeekStart, posts, search])

  const handlePostClick = (id: string) => Taro.navigateTo({ url: `/pages/post-detail/index?id=${id}` })
  const handleDemandClick = (id: string) => Taro.navigateTo({ url: `/pages/demand-detail/index?id=${id}&marketMain=${activeMarketMain}` })
  const getDemandStatusText = (demand: any) =>
    demand.scheduleStatusText || demand.statusText || (demand.status === 'closed' ? '已关闭' : '招募中')
  const getDemandActionText = (demand: any) => {
    const currentStatus = demand.scheduleStatus || demand.status
    if (currentStatus === 'closed' || currentStatus === 'ended' || currentStatus === 'expired' || currentStatus === 'cancelled') {
      return '查看结果'
    }
    if (currentStatus === 'accepted' || currentStatus === 'confirmed' || currentStatus === 'ongoing' || currentStatus === 'cancel_pending') {
      return '查看状态'
    }
    return '查看详情'
  }

  return (
    <View className={classNames('page-discover', 'page-container-full', `theme-${theme}`)}>
      <View className="discover-header">
        <View className="discover-title">
          <Text className="discover-title__main">发现</Text>
          <Text className="discover-title__sub">动态与合作机会</Text>
        </View>
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
                placeholder="搜索动态内容"
              />
            </View>

            <View className="discover-square__filters">
              <View className="discover-square__sorts">
                {SQUARE_SORT_FILTERS.map((item) => (
                  <View key={item.id} onClick={() => handleSortFilterClick(item.id)}>
                    <Tag
                      type={activeSort === item.id ? 'secondary' : 'default'}
                      outline={activeSort !== item.id}
                      size="medium"
                    >
                      {item.label}
                    </Tag>
                  </View>
                ))}
              </View>

              <View className="discover-square__tag-dropdown">
                <View
                  className={classNames('discover-square__tag-trigger', {
                    'discover-square__tag-trigger--active': tagDropdownOpen || activeTags.length > 0
                  })}
                  onClick={() => setTagDropdownOpen((prev) => !prev)}
                >
                  <Text className="discover-square__tag-trigger-text">
                    标签筛选：{activeTags.length === 0 ? '全部' : activeTags.slice(0, 2).join(' / ') + (activeTags.length > 2 ? ` 等${activeTags.length}项` : '')}
                  </Text>
                  <Text className="discover-square__tag-trigger-arrow">{tagDropdownOpen ? '收起' : '展开'}</Text>
                </View>

                {tagDropdownOpen && (
                  <View className="discover-square__tag-panel">
                    <ScrollView scrollY className="discover-square__tag-scroll">
                      <View className="discover-square__tag-options">
                        <View key="all" onClick={clearTagFilters}>
                          <Tag type={activeTags.length === 0 ? 'primary' : 'default'} outline={activeTags.length > 0} size="medium">
                            全部
                          </Tag>
                        </View>
                        {allTags.map(tag => (
                          <View key={tag} onClick={() => handleTagFilterClick(tag)}>
                            <Tag type={activeTags.includes(tag) ? 'primary' : 'default'} outline={!activeTags.includes(tag)} size="medium">
                              {tag}
                            </Tag>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            <View className="discover-waterfall">
              <View style={{ display: filterPosts.length === 0 ? 'block' : 'none' }}>
                <EmptyState title={activeSort === 'hot' ? '本周暂无热门动态' : '广场暂无动态'} />
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
                  onClick={() => handleMarketSubFilterClick(filter)}
                >
                  <Text>{filter}</Text>
                </View>
              ))}
            </View>

            <View className="discover-market__list">
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
                    statusText={getDemandStatusText(demand)}
                    actionText={getDemandActionText(demand)}
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
