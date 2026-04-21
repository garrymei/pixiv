import { View, Text, Image, Input } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useCallback, useEffect, useState } from 'react'
import { CommentItem } from '../../components/business/CommentItem'
import { Tag } from '../../components/base/Tag'
import { PrimaryButton, Button } from '../../components/base/Button'
import { EmptyState } from '../../components/base/EmptyState'
import { LoadingState } from '../../components/base/LoadingState'
import { getPostById, markPostListShouldRefresh, updatePostEngagement } from '../../services/posts'
import { createComment, listCommentsByPost } from '../../services/comments'
import { getPostLikeStatus, likePost, unlikePost } from '../../services/likes'
import { useThemeMode } from '../../config/theme'
import './index.scss'

export default function PostDetail() {
  const [postId, setPostId] = useState('')
  const [post, setPost] = useState<any>()
  const [comments, setComments] = useState<any[]>([])
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [togglingLike, setTogglingLike] = useState(false)
  const { theme } = useThemeMode()

  useLoad((options) => {
    setPostId(String(options?.id || ''))
  })

  const loadData = useCallback(async () => {
    if (!postId) return
    setLoading(true)
    setError('')
    try {
      const [postRes, commentsRes, likeRes] = await Promise.all([
        getPostById(postId),
        listCommentsByPost(postId),
        getPostLikeStatus(postId).catch(() => ({ liked: false, like_count: 0 }))
      ])
      setPost(postRes)
      setComments(commentsRes)
      setLiked(likeRes.liked)
      setLikeCount(likeRes.like_count || postRes?.likeCount || 0)
      if (postRes) {
        updatePostEngagement(postId, {
          likeCount: likeRes.like_count || postRes.likeCount || 0,
          commentCount: commentsRes.length,
          liked: likeRes.liked
        })
      }
      if (!postRes) setError('帖子不存在')
    } catch (err: any) {
      setError(err?.message || '帖子加载失败')
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleToggleLike = async () => {
    if (!postId || togglingLike) return
    const nextLiked = !liked
    const prev = { liked, likeCount }
    setTogglingLike(true)
    setLiked(nextLiked)
    setLikeCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)))
    updatePostEngagement(postId, {
      liked: nextLiked,
      likeCount: Math.max(0, likeCount + (nextLiked ? 1 : -1))
    })
    try {
      const res = nextLiked ? await likePost(postId) : await unlikePost(postId)
      setLiked(res.liked)
      setLikeCount(res.like_count)
      updatePostEngagement(postId, { liked: res.liked, likeCount: res.like_count })
      markPostListShouldRefresh()
    } catch (err: any) {
      setLiked(prev.liked)
      setLikeCount(prev.likeCount)
      updatePostEngagement(postId, { liked: prev.liked, likeCount: prev.likeCount })
      Taro.showToast({ title: err?.message || '操作失败', icon: 'none' })
    } finally {
      setTogglingLike(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      Taro.showToast({ title: '先写点内容吧', icon: 'none' })
      return
    }
    setSubmittingComment(true)
    try {
      const created = await createComment(postId, commentText.trim())
      const nextComments = [created, ...comments]
      setComments(nextComments)
      updatePostEngagement(postId, { commentCount: nextComments.length })
      markPostListShouldRefresh()
      setCommentText('')
      Taro.showToast({ title: '评论成功', icon: 'success' })
    } catch (err: any) {
      Taro.showToast({ title: err?.message || '评论失败', icon: 'none' })
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading) return <LoadingState fullScreen text="帖子加载中..." />
  if (error || !post) return <EmptyState title="加载失败" description={error || '帖子不存在'} actionText="重试" onAction={loadData} />

  const galleryImages = Array.isArray(post.images) ? post.images : []
  const heroImage = galleryImages[0] || post.coverUrl
  const detailImages = galleryImages.length > 1 ? galleryImages.slice(1) : []

  return (
    <View className={`page-post-detail page-container theme-${theme}`} style={{ paddingBottom: 'var(--safe-area-bottom)' }}>
      {heroImage ? (
        <View style={{ width: '100%', backgroundColor: 'var(--color-bg-card)' }}>
          <Image src={heroImage} mode="widthFix" style={{ width: '100%' }} />
        </View>
      ) : null}
      <View style={{ padding: 'var(--space-lg)' }}>
        <Text style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>
          {post.title}
        </Text>
        <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx', marginTop: '12rpx', marginBottom: '12rpx' }}>
          <View style={{ width: '64rpx', height: '64rpx', borderRadius: '50%', backgroundColor: 'var(--color-bg-card)' }}>
            <Image src={post.authorAvatar} mode="aspectFill" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
          </View>
          <Text style={{ color: 'var(--color-text-secondary)' }}>{post.authorName}</Text>
        </View>
        <View style={{ display: 'flex', gap: '16rpx', marginBottom: '12rpx' }}>
          <Text style={{ color: 'var(--color-text-secondary)' }}>{post.createTime || ''}</Text>
          <Text style={{ color: 'var(--color-text-secondary)' }}>点赞 {likeCount}</Text>
          <Text style={{ color: 'var(--color-text-secondary)' }}>评论 {comments.length}</Text>
        </View>
        <View style={{ display: 'flex', gap: '8rpx', marginTop: '12rpx', flexWrap: 'wrap' }}>
          {(post.tags || []).map((t: string) => (
            <Tag key={t} type="default" size="small">{t}</Tag>
          ))}
        </View>
        {post.content && (
          <View style={{ marginTop: '16rpx' }}>
            <Text style={{ color: 'var(--color-text-regular)' }}>{post.content}</Text>
          </View>
        )}
        {!!detailImages.length && (
          <View style={{ display: 'flex', flexDirection: 'column', gap: '16rpx', marginTop: '16rpx' }}>
            {detailImages.map((img: string) => (
              <Image key={img} src={img} mode="widthFix" style={{ width: '100%', borderRadius: '16rpx' }} />
            ))}
          </View>
        )}
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16rpx' }}>
          <Button size="small" type={liked ? 'secondary' : 'primary'} loading={togglingLike} onClick={handleToggleLike}>
            {liked ? `已点赞 ${likeCount}` : `点赞 ${likeCount}`}
          </Button>
          <PrimaryButton size="small" onClick={() => Taro.pageScrollTo({ scrollTop: 99999, duration: 200 })}>去评论</PrimaryButton>
        </View>
      </View>

      <View style={{ padding: '0 var(--space-lg) var(--space-lg)' }}>
        <Text style={{ display: 'block', marginBottom: '12rpx' }}>评论</Text>
        <View style={{ display: 'flex', gap: '12rpx', marginBottom: '16rpx' }}>
          <Input
            value={commentText}
            onInput={(e) => setCommentText((e.detail as any).value)}
            placeholder="说点什么..."
            style={{
              flex: 1,
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)',
              borderRadius: '12rpx',
              padding: '16rpx 20rpx'
            }}
          />
          <PrimaryButton loading={submittingComment} onClick={handleSubmitComment}>发送</PrimaryButton>
        </View>
        {comments.length === 0 ? (
          <EmptyState title="还没有评论" description="来做第一个留言的人吧" />
        ) : (
          comments.map((c) => (
            <CommentItem
              key={c.id}
              authorName={c.authorName}
              authorAvatar={c.authorAvatar}
              content={c.content}
              time={c.createTime}
              likeCount={c.likeCount}
              isLiked={c.isLiked}
            />
          ))
        )}
      </View>
    </View>
  )
}
