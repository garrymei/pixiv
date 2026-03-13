// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowRight, Sparkles, Heart, Star, Zap, Wand2, Crown, Swords, Shield, MapPin } from 'lucide-react';

// @ts-ignore;
import { AnimeEffects } from '@/components/AnimeEffects';
export default function Login({
  $w
}) {
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // 检查是否已登录
    const checkLoginStatus = async () => {
      try {
        const tcb = await $w.cloud.getCloudInstance();
        const auth = tcb.auth;
        const loginState = auth.getLoginState();
        if (loginState) {
          // 已登录，跳转到首页
          console.log('用户已登录，跳转到首页');
          $w.utils.navigateTo({
            pageId: 'home'
          });
        }
      } catch (error) {
        console.error('检查登录状态失败:', error);
      }
    };
    checkLoginStatus();
  }, []);

  // 匿名登录
  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const auth = tcb.auth;

      // 匿名登录
      await auth.anonymousAuthProvider().signIn();
      toast({
        title: '登录成功！',
        description: '欢迎来到粤次元菌的二次元世界 ✨',
        duration: 3000
      });

      // 跳转到首页
      setTimeout(() => {
        $w.utils.navigateTo({
          pageId: 'home'
        });
      }, 1000);
    } catch (error) {
      console.error('登录失败:', error);
      toast({
        title: '登录失败',
        description: '请检查网络连接后重试',
        variant: 'destructive',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
    {/* 动漫特效 */}
    <AnimeEffects type="magic" intensity="high" />
    
    {/* 背景层1 - 渐变光晕 */}
    <div className="absolute inset-0">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '1s'
      }} />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '2s'
      }} />
    </div>

    {/* 背景层2 - 游戏角色图片（原神） */}
    <div className="absolute inset-0 opacity-30">
      {/* 胡桃 - 左侧 */}
      <div className="absolute top-20 left-0 w-64 h-80 animate-bounce" style={{
        animationDuration: '4s'
      }}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Hu_Tao_%28Genshin_Impact%29.jpg/440px-Hu_Tao_%28Genshin_Impact%29.jpg" alt="胡桃" className="w-full h-full object-cover rounded-t-full" />
      </div>

      {/* 雷电将军 - 右上 */}
      <div className="absolute top-0 right-0 w-72 h-96 animate-pulse" style={{
        animationDelay: '0.5s'
      }}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Raiden_Shogun_%28Genshin_Impact%29.jpg/500px-Raiden_Shogun_%28Genshin_Impact%29.jpg" alt="雷电将军" className="w-full h-full object-cover" />
      </div>

      {/* 钟离 - 右侧 */}
      <div className="absolute top-1/3 right-10 w-64 h-80 animate-bounce" style={{
        animationDelay: '1.5s',
        animationDuration: '5s'
      }}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Zhongli_%28Genshin_Impact%29.jpg/440px-Zhongli_%28Genshin_Impact%29.jpg" alt="钟离" className="w-full h-full object-cover" />
      </div>

      {/* 甘雨 - 左下 */}
      <div className="absolute bottom-0 left-10 w-56 h-72 animate-pulse" style={{
        animationDelay: '2s'
      }}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Ganyu_%28Genshin_Impact%29.jpg/440px-Ganyu_%28Genshin_Impact%29.jpg" alt="甘雨" className="w-full h-full object-cover" />
      </div>

      {/* 纳西妲 - 中部 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-56 animate-bounce" style={{
        animationDelay: '2.5s',
        animationDuration: '6s'
      }}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Nahida_%28Genshin_Impact%29.jpg/440px-Nahida_%28Genshin_Impact%29.jpg" alt="纳西妲" className="w-full h-full object-cover" />
      </div>

      {/* 可莉 - 右下 */}
      <div className="absolute bottom-20 right-5 w-40 h-48 animate-pulse" style={{
        animationDelay: '3s'
      }}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Klee_%28Genshin_Impact%29.jpg/440px-Klee_%28Genshin_Impact%29.jpg" alt="可莉" className="w-full h-full object-cover" />
      </div>
    </div>

    {/* 背景层3 - 装饰元素 */}
    <div className="absolute inset-0 pointer-events-none">
      {/* 闪烁的星星 */}
      {Array.from({
        length: 20
      }).map((_, i) => <div key={i} className="absolute animate-pulse" style={{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2 + Math.random() * 2}s`
      }}>
          <Star size={8 + Math.random() * 8} className={`text-${['yellow', 'pink', 'purple', 'blue', 'green'][Math.floor(Math.random() * 5)]}-400`} />
        </div>)}

      {/* 闪电元素 */}
      {Array.from({
        length: 8
      }).map((_, i) => <div key={i} className="absolute animate-pulse" style={{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`
      }}>
          <Zap size={12 + Math.random() * 8} className="text-yellow-400/60" />
        </div>)}

      {/* 火花特效 */}
      {Array.from({
        length: 3
      }).map((_, i) => <div key={i} className="absolute animate-bounce" style={{
        top: `${20 + Math.random() * 60}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 4}s`,
        animationDuration: `${2 + Math.random() * 3}s`
      }}>
          <Sparkles size={16} className="text-orange-400/80" />
        </div>)}

      {/* 游戏主题emoji */}
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-4xl animate-bounce" style={{
        animationDelay: '0.5s',
        animationDuration: '3s'
      }}>
        🎮
      </div>
      <div className="absolute top-20 right-20 text-3xl animate-pulse" style={{
        animationDelay: '1s'
      }}>
        ⚔️
      </div>
      <div className="absolute bottom-20 left-20 text-3xl animate-bounce" style={{
        animationDelay: '2s',
        animationDuration: '4s'
      }}>
        ✨
      </div>
      <div className="absolute top-1/3 left-10 text-2xl animate-pulse" style={{
        animationDelay: '1.5s'
      }}>
        🎯
      </div>
      <div className="absolute bottom-1/3 right-10 text-3xl animate-bounce" style={{
        animationDelay: '2.5s',
        animationDuration: '5s'
      }}>
        🏆
      </div>
    </div>

    {/* 主内容区域 - 合并为一层 */}
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
      {/* 顶部标题区域 */}
      <div className="text-center mb-12">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl animate-bounce" style={{
            animationDuration: '2s'
          }}>
            <Heart size={32} className="text-white" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent" style={{
            fontFamily: 'Fredoka One, cursive'
          }}>
            粤次元菌
          </h1>
        </div>

        {/* 副标题 */}
        <p className="text-white/90 text-xl mb-4" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>
          你的二次元温馨家园 ✨
        </p>
        <p className="text-white/70 text-lg" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>
          与千万玩家一起探索动漫世界
        </p>
      </div>

      {/* 特色图标 */}
      <div className="flex items-center justify-center gap-8 mb-12">
        <div className="text-center group">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Swords size={36} className="text-white" />
          </div>
          <p className="text-white/80 text-sm font-bold">角色扮演</p>
        </div>

        <div className="text-center group">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Wand2 size={36} className="text-white" />
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

      {/* 游戏标签 */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
        <span className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-lg">
          原神
        </span>
        <span className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold shadow-lg">
          王者荣耀
        </span>
        <span className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold shadow-lg">
          原神社区
        </span>
        <span className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold shadow-lg">
          二次元
        </span>
      </div>

      {/* 开始冒险按钮 - 直接整合到主界面 */}
      <div className="text-center">
        <Button onClick={handleAnonymousLogin} disabled={loading} className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white rounded-2xl px-12 py-4 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 relative overflow-hidden group" style={{
          fontFamily: 'Fredoka One, cursive'
        }}>
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1s_infinite]" />
          <span className="relative z-10 flex items-center justify-center gap-3">
            {loading ? <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                登录中...
              </div> : <>
                开始冒险
                <ArrowRight size={24} />
              </>}
          </span>
        </Button>
        
        {/* 提示信息 */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <Sparkles size={16} className="text-pink-400" />
          <p className="text-sm text-white/70" style={{
            fontFamily: 'Nunito, sans-serif'
          }}>
            点击按钮，探索二次元世界
          </p>
          <Sparkles size={16} className="text-purple-400" />
        </div>
      </div>
    </div>
  </div>;
}