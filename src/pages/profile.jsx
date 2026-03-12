// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Avatar, AvatarImage, AvatarFallback, useToast } from '@/components/ui';
// @ts-ignore;
import { Heart, MapPin, Calendar, Edit, Settings, ArrowLeft, Star, Message, Trophy } from 'lucide-react';

import { BottomNav } from '@/components/BottomNav';
export default function Profile({
  $w
}) {
  const {
    toast
  } = useToast();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUser = $w.auth.currentUser || {
    name: '小樱花',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
    userId: 'user_1'
  };
  const mockProfile = {
    id: '1',
    name: '小樱花',
    nickName: 'Sakura酱',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
    userId: currentUser.userId || 'user_1',
    age: 22,
    bio: '二次元爱好者！喜欢cosplay和动漫～🎀 追求可爱的生活方式✨',
    interests: ['cosplay', '动漫', '绘画', '摄影', '旅行'],
    location: '上海',
    type: '普通用户',
    matchCount: 128,
    likeCount: 456,
    chatCount: 89,
    createdAt: '2024-01-15',
    totalPosts: 32,
    totalLikes: 1234
  };
  useEffect(() => {
    loadProfile();
  }, []);
  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log('开始加载用户档案...');
      console.log('当前用户:', currentUser);
      if (currentUser.userId) {
        const tcb = await $w.cloud.getCloudInstance();
        const db = tcb.database();
        const result = await db.collection('user_profile').where({
          userId: currentUser.userId
        }).get();
        if (result && result.data && result.data.length > 0) {
          const profileData = result.data[0];
          console.log('从数据库加载的用户档案:', profileData);
          setUserProfile(profileData);
        } else {
          console.warn('数据库中没有匹配的用户档案，使用模拟数据');
          setUserProfile(mockProfile);
        }
      } else {
        console.log('没有userId，使用模拟数据');
        setUserProfile(mockProfile);
      }
    } catch (error) {
      console.error('加载用户档案失败:', error);
      console.log('使用模拟数据');
      setUserProfile(mockProfile);
      toast({
        variant: 'destructive',
        title: '使用示例数据',
        description: error.message || '无法加载用户档案'
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-[#FFB7C5]/10 via-[#87CEEB]/10 to-[#98FB98]/10 pb-24">
      {/* 头部 */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#FFB7C5]/20">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{
          fontFamily: 'Fredoka One, cursive',
          color: '#FF6B6B'
        }}>
            我的档案
          </h1>
          <div className="flex gap-2">
            <Button size="sm" className="bg-gradient-to-r from-[#FFB7C5] to-[#87CEEB] text-white rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105" onClick={() => {
            toast({
              title: '编辑功能',
              description: '编辑功能正在开发中'
            });
          }}>
              <Edit size={16} className="mr-1" />
              编辑
            </Button>
          </div>
        </div>
      </header>
      
      {/* 主要内容 */}
      <main className="max-w-md mx-auto px-4 py-6">
        {loading ? <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#FFB7C5]/20 flex items-center justify-center animate-pulse">
              <span className="text-2xl">✨</span>
            </div>
            <p className="text-gray-600 text-sm mt-4" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>
              加载中...
            </p>
          </div> : userProfile ? <div className="space-y-6">
            {/* 头像卡片 */}
            <div className="bg-white rounded-3xl shadow-md p-6 overflow-hidden">
              <div className="relative">
                <div className="h-24 bg-gradient-to-br from-[#FFB7C5] via-[#87CEEB] to-[#98FB98] rounded-2xl mb-4"></div>
                <div className="absolute top-12 left-6">
                  <Avatar className="w-24 h-24 ring-4 ring-white ring-offset-2 shadow-lg">
                    <AvatarImage src={userProfile.avatar || currentUser.avatarUrl} alt={userProfile.name} />
                    <AvatarFallback className="bg-gradient-to-br from-[#FFB7C5] to-[#87CEEB] text-white text-3xl">
                      {userProfile.name?.[0] || currentUser.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              
              <div className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-2xl font-bold" style={{
                  fontFamily: 'Fredoka One, cursive',
                  color: '#FF6B6B'
                }}>
                      {userProfile.name || currentUser.name || '小樱花'}
                    </h2>
                    {userProfile.nickName && <p className="text-sm text-gray-500" style={{
                  fontFamily: 'Nunito, sans-serif'
                }}>
                        @{userProfile.nickName}
                      </p>}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Star size={12} className="text-yellow-500" />
                    <span>普通用户</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3" style={{
              fontFamily: 'Nunito, sans-serif'
            }}>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{userProfile.location || '未知地点'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{userProfile.age || 22}岁</span>
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed mb-3" style={{
              fontFamily: 'Nunito, sans-serif'
            }}>
                  {userProfile.bio || '还没有简介哦～✨'}
                </p>
                
                {/* 兴趣标签 */}
                {userProfile.interests && userProfile.interests.length > 0 && <div className="flex flex-wrap gap-2 mb-4">
                    {userProfile.interests.map((interest, index) => <span key={index} className="px-3 py-1 bg-gradient-to-r from-[#FFB7C5]/30 to-[#87CEEB]/30 text-gray-700 rounded-full text-xs font-medium">
                        #{interest}
                      </span>)}
                  </div>}
              </div>
            </div>
            
            {/* 统计数据卡片 */}
            <div className="bg-white rounded-3xl shadow-md p-6">
              <h3 className="text-sm font-bold text-gray-700 mb-4" style={{
            fontFamily: 'Fredoka One, cursive'
          }}>
                我的数据
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFB7C5] to-[#FF6B6B] flex items-center justify-center mx-auto mb-2">
                    <Trophy size={20} className="text-white" />
                  </div>
                  <p className="text-xl font-bold text-[#FF6B6B]" style={{
                fontFamily: 'Fredoka One, cursive'
              }}>
                    {userProfile.totalPosts || userProfile.matchCount || 128}
                  </p>
                  <p className="text-xs text-gray-500" style={{
                fontFamily: 'Nunito, sans-serif'
              }}>
                    发布动态
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#87CEEB] to-[#98FB98] flex items-center justify-center mx-auto mb-2">
                    <Heart size={20} className="text-white" />
                  </div>
                  <p className="text-xl font-bold text-[#87CEEB]" style={{
                fontFamily: 'Fredoka One, cursive'
              }}>
                    {userProfile.totalLikes || userProfile.likeCount || 456}
                  </p>
                  <p className="text-xs text-gray-500" style={{
                fontFamily: 'Nunito, sans-serif'
              }}>
                    收到喜欢
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#98FB98] to-[#FFFACD] flex items-center justify-center mx-auto mb-2">
                    <Message size={20} className="text-white" />
                  </div>
                  <p className="text-xl font-bold text-[#98FB98]" style={{
                fontFamily: 'Fredoka One, cursive'
              }}>
                    {userProfile.chatCount || 89}
                  </p>
                  <p className="text-xs text-gray-500" style={{
                fontFamily: 'Nunito, sans-serif'
              }}>
                    聊天次数
                  </p>
                </div>
              </div>
            </div>
            
            {/* 互动统计 */}
            <div className="bg-white rounded-3xl shadow-md p-6">
              <h3 className="text-sm font-bold text-gray-700 mb-4" style={{
            fontFamily: 'Fredoka One, cursive'
          }}>
                互动统计
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#FFB7C5]/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Heart size={18} className="text-[#FF6B6B]" />
                    <span className="text-sm text-gray-700" style={{
                  fontFamily: 'Nunito, sans-serif'
                }}>
                      喜欢我的人数
                    </span>
                  </div>
                  <span className="text-lg font-bold text-[#FF6B6B]" style={{
                fontFamily: 'Fredoka One, cursive'
              }}>
                    {userProfile.likeCount || 456}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#87CEEB]/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Message size={18} className="text-[#87CEEB]" />
                    <span className="text-sm text-gray-700" style={{
                  fontFamily: 'Nunito, sans-serif'
                }}>
                      匹配成功数
                    </span>
                  </div>
                  <span className="text-lg font-bold text-[#87CEEB]" style={{
                fontFamily: 'Fredoka One, cursive'
              }}>
                    {userProfile.matchCount || 128}
                  </span>
                </div>
              </div>
            </div>
          </div> : <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#FFB7C5]/20 flex items-center justify-center">
              <span className="text-2xl">📭</span>
            </div>
            <p className="text-gray-600 text-sm mt-4" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>
              还没有档案哦～
            </p>
          </div>}
      </main>
      
      <BottomNav $w={$w} currentPage="profile" />
    </div>;
}