import { View, Text } from '@tarojs/components'
import { useEffect, useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import classNames from 'classnames'

import { Input } from '../../components/base/Input'
import { Tag } from '../../components/base/Tag'
import { QuickEntryGrid } from '../../components/business/QuickEntryGrid'
import { PostCard } from '../../components/business/PostCard'
import { EmptyState } from '../../components/base/EmptyState'

import { listPosts } from '../../services/posts'

import './index.scss'

const CATEGORIES = [
  { id: 'cat_1', title: 'Cosplay', icon: '🎭', url: '/pages/home/index' },
  { id: 'cat_2', title: '摄影', icon: '📷', url: '/pages/home/index' },
  { id: 'cat_3', title: '妆造', icon: '💄', url: '/pages/home/index' },
  { id: 'cat_4', title: '日常', icon: '🌙', url: '/pages/home/index' }
]

export default function Discover() {
  const [search, setSearch] = useState('')
  const [posts, setPosts] = useState<any[]>([])
  const allTags = useMemo(() => {
    const s = new Set<string>()
    posts.forEach(p => p.tags.forEach((t: string) => s.add(t)))
    return Array.from(s)
  }, [posts])
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const filterPosts = useMemo(() => {
    let list = posts
    if (activeTag) list = list.filter(p => p.tags.includes(activeTag))
    if (search.trim()) list = list.filter(p => p.title.includes(search.trim()))
    return list
  }, [activeTag, search, posts])

  useEffect(() => {
    listPosts().then(setPosts)
  }, [])

  const handleCardClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/post-detail/index?id=${id}` })
  }

  return (
    <View className="page-discover page-container">
      <View className="discover-search">
        <Input
          value={search}
          onInput={e => setSearch((e.detail as any).value)}
          placeholder="搜索你感兴趣的内容"
          wrapperClass="page-container"
        />
      </View>

      <View className="discover-section">
        <Text className="section-title">热门标签</Text>
      </View>
      <View className="discover-tags">
        {allTags.map(tag => (
          <View key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}>
            <Tag
              type={activeTag === tag ? 'primary' : 'default'}
              outline={activeTag !== tag}
              size="medium"
              className={classNames({})}
            >
              {tag}
            </Tag>
          </View>
        ))}
      </View>

      <View className="discover-section">
        <Text className="section-title">分类入口</Text>
      </View>
      <View className="discover-categories">
        <QuickEntryGrid
          items={CATEGORIES}
          onItemClick={item => Taro.navigateTo({ url: item.url || '/pages/home/index' })}
        />
      </View>

      <View className="discover-section">
        <Text className="section-title">推荐内容</Text>
      </View>
      <View className="discover-list">
        {filterPosts.length === 0 ? (
          <EmptyState title="暂无内容" />
        ) : (
          filterPosts.map(p => (
            <PostCard
              key={p.id}
              coverUrl={p.coverUrl}
              title={p.title}
              authorName={p.authorName}
              authorAvatar={p.authorAvatar}
              likeCount={p.likeCount}
              commentCount={p.commentCount}
              tags={p.tags}
              onClick={() => handleCardClick(p.id)}
            />
          ))
        )}
      </View>
    </View>
  )
}
