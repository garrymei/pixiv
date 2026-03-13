// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowRight, Sparkles as SparklesIcon, Heart, Star, Zap, Crown, Swords, Shield, MapPin, Sparkle, Flame, Wind, Mountain, Moon, Sun, Galaxy, Orbit, Rocket, Gamepad2, Palette, Music, Camera, Film, Tv, BookOpen, HeartPulse } from 'lucide-react';

// @ts-ignore;
import { AnimeEffects } from '@/components/AnimeEffects';
export default function Login({
  $w
}) {
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();

  // 匿名登录
  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      const result = await $w.cloud.callFunction({
        name: 'auth',
        data: {
          action: 'anonymousLogin'
        }
      });
      if (result.success) {
        toast({
          title: '✨ 登录成功！',
          description: '欢迎来到动漫世界 ✨'
        });

        // 跳转到首页
        setTimeout(() => {
          $w.utils.navigateTo({
            pageId: 'home'
          });
        }, 1000);
      } else {
        throw new Error(result.message || '登录失败');
      }
    } catch (error) {
      toast({
        title: '登录失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="relative min-h-screen overflow-hidden">
      {/* 动漫特效 */}
      <AnimeEffects type="magic" intensity="high" />
      
      {/* 背景层1 - 渐变光晕 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
      
      {/* 背景层2 - 魔法光晕 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 大型紫色光晕 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{
        animationDuration: '4s'
      }} />
        
        {/* 蓝色光晕 */}
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{
        animationDuration: '5s',
        animationDelay: '1s'
      }} />
        
        {/* 粉色光晕 */}
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-pink-500/30 via-rose-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{
        animationDuration: '6s',
        animationDelay: '2s'
      }} />
        
        {/* 青色光晕 */}
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-gradient-to-br from-cyan-500/30 via-teal-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{
        animationDuration: '3.5s',
        animationDelay: '0.5s'
      }} />
      </div>

      {/* 背景层3 - 动漫装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 魔法星星 */}
        <div className="absolute top-20 left-10 animate-bounce" style={{
        animationDuration: '2s'
      }}>
          <Star size={20} className="text-yellow-300/80 animate-pulse" />
        </div>
        <div className="absolute top-32 right-16 animate-bounce" style={{
        animationDuration: '3s',
        animationDelay: '0.5s'
      }}>
          <Star size={16} className="text-pink-300/80 animate-pulse" />
        </div>
        <div className="absolute bottom-40 left-20 animate-bounce" style={{
        animationDuration: '2.5s',
        animationDelay: '1s'
      }}>
          <Star size={18} className="text-cyan-300/80 animate-pulse" />
        </div>
        <div className="absolute top-1/2 right-10 animate-bounce" style={{
        animationDuration: '4s',
        animationDelay: '1.5s'
      }}>
          <Sparkle size={22} className="text-purple-300/80 animate-pulse" />
        </div>
        
        {/* 魔法粒子 */}
        <div className="absolute top-16 left-1/4 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full animate-ping" style={{
        animationDuration: '3s'
      }} />
        <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full animate-ping" style={{
        animationDuration: '4s',
        animationDelay: '1s'
      }} />
        <div className="absolute top-1/3 right-20 w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full animate-ping" style={{
        animationDuration: '2.5s',
        animationDelay: '0.5s'
      }} />
        
        {/* 魔法光环 */}
        <div className="absolute top-24 left-1/4 w-12 h-12 border-2 border-purple-400/30 rounded-full animate-spin" style={{
        animationDuration: '8s'
      }} />
        <div className="absolute bottom-32 right-1/4 w-8 h-8 border-2 border-pink-400/30 rounded-full animate-spin" style={{
        animationDuration: '6s',
        animationDelay: '2s'
      }} />
        
        {/* 魔法符号 */}
        <div className="absolute top-1/4 left-10 text-2xl animate-pulse" style={{
        animationDuration: '3s'
      }}>✨</div>
        <div className="absolute bottom-1/4 right-16 text-3xl animate-pulse" style={{
        animationDuration: '4s',
        animationDelay: '1s'
      }}>🌟</div>
        <div className="absolute top-2/3 left-1/3 text-2xl animate-pulse" style={{
        animationDuration: '2.5s',
        animationDelay: '0.5s'
      }}>💫</div>
        <div className="absolute top-1/3 right-1/4 text-xl animate-pulse" style={{
        animationDuration: '3.5s',
        animationDelay: '1.5s'
      }}>⭐</div>
      </div>

      {/* 主内容区域 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Crown className="text-yellow-400 animate-bounce" size={32} />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent" style={{
            fontFamily: 'Fredoka One, cursive',
            textShadow: '0 0 30px rgba(255, 182, 193, 0.5)'
          }}>
              粤次元菌
            </h1>
            <Crown className="text-yellow-400 animate-bounce" size={32} />
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="text-pink-400 animate-pulse" size={20} />
            <p className="text-white/90 text-xl font-medium" style={{
            fontFamily: 'Fredoka One, cursive'
          }}>
              你的动漫温馨家园 ✨
            </p>
            <Heart className="text-pink-400 animate-pulse" size={20} />
          </div>
          
          <p className="text-white/70 text-lg">
            与千万玩家一起探索动漫世界
          </p>
        </div>

        {/* 特色图标 - 用纯动漫视觉元素 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-2xl">
          <div className="text-center group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Swords size={36} className="text-white" />
            </div>
            <p className="text-white/80 text-sm font-bold">角色扮演</p>
          </div>

          <div className="text-center group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Sparkles size={36} className="text-white" />
            </div>
            <p className="text-white/80 text-sm font-bold">魔法冒险</p>
          </div>

          <div className="text-center group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Shield size={36} className="text-white" />
            </div>
            <p className="text-white/80 text-sm font-bold">社区互动</p>
          </div>

          <div className="text-center group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <MapPin size={36} className="text-white" />
            </div>
            <p className="text-white/80 text-sm font-bold">世界探索</p>
          </div>
        </div>

        {/* 动漫元素装饰 - 替代文字标签 */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          {/* 魔法水晶 */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30">
            <div className="w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-pulse" />
            <Sparkle size={16} className="text-purple-300" />
            <div className="w-3 h-3 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full animate-pulse" />
          </div>
          
          {/* 魔法火焰 */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-400/30">
            <Flame size={16} className="text-orange-300 animate-pulse" />
            <div className="w-2 h-2 bg-gradient-to-br from-orange-400 to-red-400 rounded-full" />
            <Flame size={16} className="text-red-300 animate-pulse" />
          </div>
          
          {/* 魔法风 */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-400/30">
            <Wind size={16} className="text-cyan-300 animate-bounce" />
            <div className="w-3 h-3 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full animate-spin" />
          </div>
          
          {/* 魔法星星 */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 backdrop-blur-sm border border-yellow-400/30">
            <Star size={16} className="text-yellow-300 animate-pulse" />
            <div className="w-2 h-2 bg-gradient-to-br from-yellow-400 to-amber-400 rounded-full animate-ping" />
            <Star size={16} className="text-amber-300 animate-pulse" />
          </div>
        </div>

        {/* 开始冒险按钮 - 整合到主界面 */}
        <div className="text-center">
          <Button onClick={handleAnonymousLogin} disabled={loading} className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white rounded-2xl px-16 py-5 text-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 relative overflow-hidden group" style={{
          fontFamily: 'Fredoka One, cursive'
        }}>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1s_infinite]" />
            <span className="relative z-10 flex items-center justify-center gap-4">
              {loading ? <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  登录中...
                </div> : <>
                  开始冒险
                  <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
                </>}
            </span>
          </Button>
          
          <p className="text-white/60 text-sm mt-4">
            点击按钮，探索动漫世界
          </p>
        </div>

        {/* 底部装饰元素 */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
          <div className="w-2 h-2 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-bounce" style={{
          animationDelay: '0s'
        }} />
          <div className="w-2 h-2 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full animate-bounce" style={{
          animationDelay: '0.2s'
        }} />
          <div className="w-2 h-2 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full animate-bounce" style={{
          animationDelay: '0.4s'
        }} />
          <div className="w-2 h-2 bg-gradient-to-br from-yellow-400 to-amber-400 rounded-full animate-bounce" style={{
          animationDelay: '0.6s'
        }} />
        </div>
      </div>
    </div>;
}