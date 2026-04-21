import { View } from '@tarojs/components'
import { useCallback, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { PostCard } from '../../components/business/PostCard'
import { EmptyState } from '../../components/base/EmptyState'
import { LoadingState } from '../../components/base/LoadingState'
import { listMyPosts } from '../../services/posts'
import { useThemeMode } from '../../config/theme'

export default function MyPosts() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { theme } = useThemeMode()

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listMyPosts()
      setPosts(data)
    } catch (err: any) {
      setError(err?.message || '我的发布加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useDidShow(() => {
    loadData()
  })

  if (loading) return <LoadingState fullScreen text="我的发布加载中..." />
  if (error) return <EmptyState title="加载失败" description={error} actionText="重试" onAction={loadData} />

  return (
    <View className={`page-container theme-${theme}`} style={{ padding: 'var(--space-md)' }}>
      {posts.length === 0 ? (
        <EmptyState title="暂无发布" />
      ) : (
        posts.map(post => (
          <PostCard
            key={post.id}
            coverUrl={post.coverUrl}
            title={post.title}
            authorName={post.authorName}
            authorAvatar={post.authorAvatar}
            likeCount={post.likeCount}
            commentCount={post.commentCount}
            tags={post.tags}
            onClick={() => Taro.navigateTo({ url: `/pages/post-detail/index?id=${post.id}` })}
          />
        ))
      )}
    </View>
  )
}
