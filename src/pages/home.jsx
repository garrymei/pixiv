// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';

import { PostCard } from '@/components/PostCard';
import { BottomNav } from '@/components/BottomNav';
export default function Home({
  $w
}) {
  const {
    toast
  } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = $w.auth.currentUser || {};
  const mockPosts = [{
    id: 'post_1',
    name: '小樱花',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    content: '今天去了一次漫展，看到了好多喜欢的角色！cosplay们都好厉害呀～🎀 #cosplay #动漫',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&h=400&fit=crop',
    tags: ['cosplay', '动漫'],
    location: '上海',
    time: '5分钟前',
    likeCount: 128,
    commentCount: 32,
    isLiked: true
  }, {
    id: 'post_2',
    name: '星空猫',
    avatar: 'https://images.unsplash.com/photo-1527003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    content: '分享一下今天的绘画进度～还是觉得自己还有好多要学习的地方😢 绘画日常',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=400&fit=crop',
    tags: ['绘画', '日常'],
    location: '北京',
    time: '30分钟前',
    likeCount: 86,
    commentCount: 15,
    isLiked: false
  }, {
    id: 'post_3',
    name: '薄荷糖',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    content: '最近沉迷这个游戏不能自拔！有没有一起玩的小伙伴呀～求组队！🎮',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop',
    tags: ['游戏', '日常'],
    location: '深圳',
    time: '1小时前',
    likeCount: 234,
    commentCount: 56,
    isLiked: true
  }, {
    id: 'post_4',
    name: '彩虹酱',
    avatar: 'https://images.unsplash.com/photo-1438761689735-6d2451b95e6a?w=200&h=200&fit=crop',
    content: '终于完成了这个手办！花费了好长时间，但是看到成果真的很开心✨ 手工日常 #手工',
    image: null,
    tags: ['手工'],
    location: '杭州',
    time: '2小时前',
    likeCount: 189,
    commentCount: 41,
    isLiked: false
  }, {
    id: 'post_5',
    name: '小汤圆',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
    content: '今天的夕阳超级美！忍不住拍了很多照片～ 旅行 摄影 #旅行 #摄影',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
    tags: ['旅行', '摄影'],
    location: '成都',
    time: '3小时前',
    likeCount: 312,
    commentCount: 68,
    isLiked: false
  }];
  useEffect(() => {
    loadPosts();
  }, []);
  const loadPosts = async () => {
    try {
      setLoading(true);
      console.log('开始加载动态...');

      // 尝试从数据库加载
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('daily_posts').orderBy('createdAt', 'desc').limit(20).get();
      if (result && result.data && result.data.length > 0) {
        const formattedPosts = result.data.map(record => ({
          id: record._id,
          name: record.name,
          avatar: record.avatar,
          content: record.content,
          image: record.image,
          tags: record.tags || [],
          location: record.location || '未知地点',
          time: formatTime(record.createdAt),
          likeCount: record.likeCount || 0,
          commentCount: record.commentCount || 0,
          isLiked: record.isLiked || false
        }));
        console.log('从数据库加载的动态:', formattedPosts);
        setPosts(formattedPosts);
      } else {
        console.warn('数据库中没有动态，使用模拟数据');
        setPosts(mockPosts);
      }
    } catch (error) {
      console.error('加载动态失败:', error);
      console.log('使用模拟数据');
      setPosts(mockPosts);
      toast({
        variant: 'destructive',
        title: '使用示例数据',
        description: error.message || '无法加载动态'
      });
    } finally {
      setLoading(false);
    }
  };
  const formatTime = timestamp => {
    if (!timestamp) return '刚刚';
    const now = new Date().getTime();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
  };
  const handleLike = async postId => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const post = posts.find(p => p.id === postId);
      await db.collection('daily_posts').doc(postId).update({
        likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
        isLiked: !post.isLiked
      });
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
            isLiked: !p.isLiked
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('点赞失败:', error);
      // 本地更新
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
            isLiked: !p.isLiked
          };
        }
        return p;
      }));
    }
  };
  const handleComment = postId => {
    toast({
      title: '评论功能',
      description: '评论功能正在开发中'
    });
  };
  return <div className="min-h-screen bg-gradient-to-br from-[#FFB7C5]/10 via-[#87CEEB]/10 to-[#98FB98]/10 pb-24">
      {/* 头部 */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#FFB7C5]/20">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold" style={{
          fontFamily: 'Fredoka One, cursive',
          color: '#FF6B6B'
        }}>
            动态广场
          </h1>
        </div>
      </header>
      
      {/* 主要内容 */}
      <main className="max-w-md mx-auto px-4 py-4">
        {loading ? <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#FFB7C5]/20 flex items-center justify-center animate-pulse">
              <span className="text-2xl">✨</span>
            </div>
            <p className="text-gray-600 text-sm mt-4" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>
              加载中...
            </p>
          </div> : posts.length > 0 ? <div className="space-y-4">
            {posts.map(post => <PostCard key={post.id} post={post} onLike={handleLike} onComment={handleComment} />)}
          </div> : <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#FFB7C5]/20 flex items-center justify-center">
              <span className="text-2xl">📭</span>
            </div>
            <p className="text-gray-600 text-sm mt-4" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>
              还没有动态哦～
            </p>
            <p className="text-gray-400 text-xs" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>
              发布第一条动态吧！✨
            </p>
          </div>}
      </main>
      
      <BottomNav $w={$w} currentPage="home" />
    </div>;
}