// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { Star, Sparkles, Heart, Zap } from 'lucide-react';

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
  return <div className="min-h-screen bg-gradient-to-br from-[#FFB7C5]/20 via-[#87CEEB]/15 to-[#98FB98]/20 pb-24 relative overflow-hidden">
      {/* 动态背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 漂浮的星星 */}
        <div className="absolute top-20 left-8 animate-pulse">
          <Star size={14} className="text-[#FFB7C5]/30" />
        </div>
        <div className="absolute top-40 right-12 animate-pulse delay-300">
          <Star size={12} className="text-[#87CEEB]/30" />
        </div>
        <div className="absolute bottom-60 left-16 animate-pulse delay-500">
          <Star size={16} className="text-[#98FB98]/30" />
        </div>
        <div className="absolute top-1/2 right-8 animate-pulse delay-200">
          <Sparkles size={18} className="text-[#FFD700]/30" />
        </div>
        <div className="absolute bottom-32 right-1/4 animate-pulse delay-400">
          <Heart size={14} className="text-[#FFB7C5]/20" />
        </div>
        <div className="absolute top-1/3 left-1/3 animate-pulse delay-600">
          <Zap size={12} className="text-[#87CEEB]/20" />
        </div>

        {/* 可爱的装饰元素 */}
        <div className="absolute top-28 right-20 text-2xl animate-pulse opacity-40">🌸</div>
        <div className="absolute bottom-40 left-1/4 text-xl animate-pulse delay-300 opacity-40">🌺</div>
        <div className="absolute top-2/3 left-10 text-xl animate-pulse delay-500 opacity-40">💫</div>
        <div className="absolute bottom-24 right-24 text-2xl animate-pulse delay-700 opacity-40">✨</div>
        <div className="absolute top-1/2 right-1/2 text-xl animate-pulse delay-200 opacity-40">🌟</div>

        {/* 漂浮的圆圈 */}
        <div className="absolute top-16 left-1/3 w-20 h-20 bg-gradient-to-br from-[#FFB7C5]/10 to-[#FFB7C5]/5 rounded-full animate-bounce" style={{
        animationDuration: '3s'
      }} />
        <div className="absolute bottom-28 right-1/4 w-16 h-16 bg-gradient-to-br from-[#87CEEB]/10 to-[#87CEEB]/5 rounded-full animate-bounce" style={{
        animationDuration: '4s',
        animationDelay: '1s'
      }} />
        <div className="absolute top-1/3 right-16 w-12 h-12 bg-gradient-to-br from-[#98FB98]/10 to-[#98FB98]/5 rounded-full animate-bounce" style={{
        animationDuration: '2.5s',
        animationDelay: '0.5s'
      }} />
      </div>

      {/* 头部 */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b-2 border-[#FFB7C5]/30 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-5 relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{
              fontFamily: 'Fredoka One, cursive',
              color: '#FF6B6B'
            }}>
                动态广场 ✨
              </h1>
              <p className="text-xs text-gray-400 mt-1" style={{
              fontFamily: 'Nunito, sans-serif'
            }}>探索二次元的世界～</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎀</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* 主要内容 */}
      <main className="max-w-md mx-auto px-4 py-6 relative z-10">
        {loading ? <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFB7C5] to-[#87CEEB] flex items-center justify-center animate-bounce shadow-lg" style={{
          animationDuration: '1.5s'
        }}>
              <Sparkles size={32} className="text-white" />
            </div>
            <p className="text-gray-600 text-sm mt-6 font-medium" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>
              正在加载精彩内容...
            </p>
            <p className="text-gray-400 text-xs mt-2" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>💫 请稍等片刻 💫</p>
          </div> : posts.length > 0 ? <div className="space-y-5">
            {posts.map(post => <PostCard key={post.id} post={post} onLike={handleLike} onComment={handleComment} />)}
          </div> : <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFB7C5]/30 to-[#87CEEB]/30 flex items-center justify-center animate-bounce shadow-lg" style={{
          animationDuration: '2s'
        }}>
              <span className="text-4xl">📭</span>
            </div>
            <p className="text-gray-600 text-sm mt-6 font-medium" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>
              还没有动态哦～
            </p>
            <p className="text-gray-400 text-xs mt-2" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>
              成为第一个发布动态的小伙伴吧！✨
            </p>
            <div className="flex gap-2 mt-4">
              <span className="text-2xl">🌸</span>
              <span className="text-2xl">🌺</span>
              <span className="text-2xl">🌸</span>
            </div>
          </div>}
      </main>
      
      <BottomNav $w={$w} currentPage="home" />
    </div>;
}