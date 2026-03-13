// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Avatar, AvatarImage, AvatarFallback, useToast } from '@/components/ui';
// @ts-ignore;
import { Heart, MapPin, Calendar, Edit, Settings, ArrowLeft, Star, Message, Trophy, Sparkles, Zap } from 'lucide-react';

import { BottomNav } from '@/components/BottomNav';
import { AnimeEffects, EffectTrigger } from '@/components/AnimeEffects';
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
  return <div className="min-h-screen bg-gradient-to-br from-[#FFB7C5]/20 via-[#87CEEB]/15 to-[#98FB98]/20 pb-24 relative overflow-hidden">
      {/* 动漫特效 */}
      <AnimeEffects type="romantic" intensity="medium" />
      {/* 动态背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 原神角色背景 */}
        {/* 芙宁娜 - 左上角 */}
        <div className="absolute top-0 left-0 w-48 h-48 opacity-8 animate-bounce rounded-2xl" style={{
        animationDuration: '4s'
      }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Raiden_Shogun_%28Genshin_Impact%29.jpg/500px-Raiden_Shogun_%28Genshin_Impact%29.jpg" alt="芙宁娜" className="w-full h-full object-cover rounded-2xl" />
        </div>
        
        {/* 纳西妲 - 右上角 */}
        <div className="absolute top-5 right-0 w-40 h-48 opacity-8 animate-pulse rounded-2xl" style={{
        animationDelay: '0.5s'
      }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Nahida_%28Genshin_Impact%29.jpg/500px-Nahida_%28Genshin_Impact%29.jpg" alt="纳西妲" className="w-full h-full object-cover rounded-2xl" />
        </div>
        
        {/* 温迪 - 左下角 */}
        <div className="absolute bottom-0 left-5 w-44 h-52 opacity-8 animate-pulse rounded-2xl" style={{
        animationDelay: '1s'
      }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Raiden_Shogun_%28Genshin_Impact%29.jpg/500px-Raiden_Shogun_%28Genshin_Impact%29.jpg" alt="温迪" className="w-full h-full object-cover rounded-2xl" />
        </div>
        
        {/* 甘雨 - 右下角 */}
        <div className="absolute bottom-10 right-5 w-48 h-56 opacity-8 animate-bounce rounded-2xl" style={{
        animationDelay: '1.5s',
        animationDuration: '5s'
      }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Ganyu_%28Genshin_Impact%29.jpg/500px-Ganyu_%28Genshin_Impact%29.jpg" alt="甘雨" className="w-full h-full object-cover rounded-2xl" />
        </div>
        
        {/* 胡桃 - 中部偏上 */}
        <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-40 h-48 opacity-8 animate-pulse rounded-2xl" style={{
        animationDelay: '2s'
      }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Hu_Tao_%28Genshin_Impact%29.jpg/500px-Hu_Tao_%28Genshin_Impact%29.jpg" alt="胡桃" className="w-full h-full object-cover rounded-2xl" />
        </div>
        
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
                我的档案 🎀
              </h1>
              <p className="text-xs text-gray-400 mt-1" style={{
              fontFamily: 'Nunito, sans-serif'
            }}>展示你的二次元魅力～</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <Button size="sm" className="bg-gradient-to-r from-[#FFB7C5] to-[#87CEEB] text-white rounded-full hover:shadow-xl transition-all duration-300 hover:scale-105" onClick={() => {
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
              正在加载档案...
            </p>
            <p className="text-gray-400 text-xs mt-2" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>💫 请稍等片刻 💫</p>
          </div> : userProfile ? <div className="space-y-6">
            {/* 头像卡片 */}
            <div className="bg-white/95 backdrop-blur-xl rounded-[40px] shadow-2xl p-8 overflow-hidden relative border-4 border-white">
              {/* 卡片装饰 */}
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-[#FFB7C5] to-[#FF6B6B] rounded-full opacity-80" />
              <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-gradient-to-br from-[#87CEEB] to-[#98FB98] rounded-full opacity-80" />
              
              <div className="relative">
                <div className="h-28 bg-gradient-to-br from-[#FFB7C5] via-[#87CEEB] to-[#98FB98] rounded-3xl mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-50">
                    <span className="text-2xl">🌸</span>
                    <span className="text-2xl">🌺</span>
                    <span className="text-2xl">🌸</span>
                  </div>
                </div>
                <div className="absolute top-14 left-8">
                  <Avatar className="w-28 h-28 ring-4 ring-white ring-offset-4 shadow-2xl border-4 border-[#FFB7C5]/30">
                    <AvatarImage src={userProfile.avatar || currentUser.avatarUrl} alt={userProfile.name} />
                    <AvatarFallback className="bg-gradient-to-br from-[#FFB7C5] to-[#87CEEB] text-white text-3xl font-bold" style={{
                  fontFamily: 'Fredoka One, cursive'
                }}>
                      {userProfile.name?.[0] || currentUser.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              
              <div className="pt-8">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-3xl font-bold mb-1" style={{
                  fontFamily: 'Fredoka One, cursive',
                  color: '#FF6B6B'
                }}>
                      {userProfile.name || currentUser.name || '小樱花'}
                    </h2>
                    {userProfile.nickName && <p className="text-sm text-gray-500 font-medium" style={{
                  fontFamily: 'Nunito, sans-serif'
                }}>
                        @{userProfile.nickName}
                      </p>}
                  </div>
                  <div className="flex items-center gap-1 text-xs bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 px-3 py-1 rounded-full">
                    <Star size={12} className="text-yellow-500" />
                    <span className="text-gray-600 font-medium">普通用户</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-600 mb-4 font-medium" style={{
              fontFamily: 'Nunito, sans-serif'
            }}>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-[#FFB7C5]/20 to-[#FFB7C5]/10 px-3 py-2 rounded-full">
                    <MapPin size={16} className="text-[#FF6B6B]" />
                    <span>{userProfile.location || '未知地点'}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-[#87CEEB]/20 to-[#87CEEB]/10 px-3 py-2 rounded-full">
                    <Calendar size={16} className="text-[#87CEEB]" />
                    <span>{userProfile.age || 22}岁</span>
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed mb-4 text-base" style={{
              fontFamily: 'Nunito, sans-serif'
            }}>
                  {userProfile.bio || '还没有简介哦～✨'}
                </p>
                
                {/* 兴趣标签 */}
                {userProfile.interests && userProfile.interests.length > 0 && <div className="flex flex-wrap gap-2 mb-4">
                    {userProfile.interests.map((interest, index) => <span key={index} className="px-4 py-2 bg-gradient-to-r from-[#FFB7C5]/30 via-[#87CEEB]/20 to-[#98FB98]/30 text-gray-700 rounded-full text-xs font-bold shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105" style={{
                fontFamily: 'Fredoka One, cursive'
              }}>
                        #{interest}
                      </span>)}
                  </div>}
              </div>
            </div>
            
            {/* 统计数据卡片 */}
            <div className="bg-white/95 backdrop-blur-xl rounded-[40px] shadow-2xl p-8 relative border-4 border-white">
              {/* 卡片装饰 */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-[#FFB7C5] to-[#FF6B6B] rounded-full opacity-60" />
              
              <h3 className="text-base font-bold text-gray-700 mb-6 flex items-center gap-2" style={{
            fontFamily: 'Fredoka One, cursive'
          }}>
                <span>✨</span>
                我的数据
              </h3>
              <div className="grid grid-cols-3 gap-5">
                <div className="text-center p-4 rounded-3xl bg-gradient-to-br from-[#FFB7C5]/10 via-[#FFB7C5]/5 to-transparent hover:from-[#FFB7C5]/20 hover:to-transparent transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFB7C5] to-[#FF6B6B] flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Trophy size={28} className="text-white" />
                  </div>
                  <p className="text-2xl font-bold text-[#FF6B6B]" style={{
                fontFamily: 'Fredoka One, cursive'
              }}>
                    {userProfile.totalPosts || userProfile.matchCount || 128}
                  </p>
                  <p className="text-xs text-gray-500 font-medium mt-1" style={{
                fontFamily: 'Nunito, sans-serif'
              }}>
                    发布动态
                  </p>
                </div>
                <div className="text-center p-4 rounded-3xl bg-gradient-to-br from-[#87CEEB]/10 via-[#87CEEB]/5 to-transparent hover:from-[#87CEEB]/20 hover:to-transparent transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#87CEEB] to-[#98FB98] flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Heart size={28} className="text-white" />
                  </div>
                  <p className="text-2xl font-bold text-[#87CEEB]" style={{
                fontFamily: 'Fredoka One, cursive'
              }}>
                    {userProfile.totalLikes || userProfile.likeCount || 456}
                  </p>
                  <p className="text-xs text-gray-500 font-medium mt-1" style={{
                fontFamily: 'Nunito, sans-serif'
              }}>
                    收到喜欢
                  </p>
                </div>
                <div className="text-center p-4 rounded-3xl bg-gradient-to-br from-[#98FB98]/10 via-[#98FB98]/5 to-transparent hover:from-[#98FB98]/20 hover:to-transparent transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#98FB98] to-[#FFFACD] flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Message size={28} className="text-white" />
                  </div>
                  <p className="text-2xl font-bold text-[#98FB98]" style={{
                fontFamily: 'Fredoka One, cursive'
              }}>
                    {userProfile.chatCount || 89}
                  </p>
                  <p className="text-xs text-gray-500 font-medium mt-1" style={{
                fontFamily: 'Nunito, sans-serif'
              }}>
                    聊天次数
                  </p>
                </div>
              </div>
            </div>
            
            {/* 互动统计 */}
            <div className="bg-white/95 backdrop-blur-xl rounded-[40px] shadow-2xl p-8 relative border-4 border-white">
              {/* 卡片装饰 */}
              <div className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-br from-[#87CEEB] to-[#98FB98] rounded-full opacity-60" />
              
              <h3 className="text-base font-bold text-gray-700 mb-6 flex items-center gap-2" style={{
            fontFamily: 'Fredoka One, cursive'
          }}>
                <span>💫</span>
                互动统计
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#FFB7C5]/20 via-[#FFB7C5]/10 to-transparent rounded-2xl hover:from-[#FFB7C5]/30 hover:via-[#FFB7C5]/20 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFB7C5] to-[#FF6B6B] flex items-center justify-center shadow-md">
                      <Heart size={20} className="text-white" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium" style={{
                  fontFamily: 'Nunito, sans-serif'
                }}>
                      喜欢我的人数
                    </span>
                  </div>
                  <span className="text-xl font-bold text-[#FF6B6B]" style={{
                fontFamily: 'Fredoka One, cursive'
              }}>
                    {userProfile.likeCount || 456}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#87CEEB]/20 via-[#87CEEB]/10 to-transparent rounded-2xl hover:from-[#87CEEB]/30 hover:via-[#87CEEB]/20 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#87CEEB] to-[#98FB98] flex items-center justify-center shadow-md">
                      <Message size={20} className="text-white" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium" style={{
                  fontFamily: 'Nunito, sans-serif'
                }}>
                      匹配成功数
                    </span>
                  </div>
                  <span className="text-xl font-bold text-[#87CEEB]" style={{
                fontFamily: 'Fredoka One, cursive'
              }}>
                    {userProfile.matchCount || 128}
                  </span>
                </div>
              </div>
            </div>
          </div> : <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFB7C5]/30 to-[#87CEEB]/30 flex items-center justify-center animate-bounce shadow-lg" style={{
          animationDuration: '2s'
        }}>
              <span className="text-4xl">📭</span>
            </div>
            <p className="text-gray-600 text-sm mt-6 font-medium" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>
              还没有档案哦～
            </p>
            <p className="text-gray-400 text-xs mt-2" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>💫 创建你的二次元档案吧 💫</p>
            <div className="flex gap-2 mt-4">
              <span className="text-2xl">🌸</span>
              <span className="text-2xl">🌺</span>
              <span className="text-2xl">🌸</span>
            </div>
          </div>}
      </main>
      
      <BottomNav $w={$w} currentPage="profile" />
    </div>;
}