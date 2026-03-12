// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Heart, Sparkles, ArrowRight, Star, Smile, Zap } from 'lucide-react';

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
  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const auth = tcb.auth;
      await auth.anonymousAuthProvider().signIn();
      toast({
        title: '欢迎回来～ 🎀',
        description: '二次元的大门已经为你敞开！✨'
      });

      // 跳转到首页
      setTimeout(() => {
        $w.utils.navigateTo({
          pageId: 'home'
        });
      }, 500);
    } catch (error) {
      console.error('登录失败:', error);
      toast({
        variant: 'destructive',
        title: '登录失败 >_<',
        description: error.message || '哎呀，登录出错了，请再试一次哦～'
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-[#FFB7C5]/40 via-[#87CEEB]/30 to-[#98FB98]/40 flex items-center justify-center p-4 overflow-hidden relative">
      {/* 动态背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 原神角色背景 */}
        {/* 钟离 - 左上角 */}
        <div className="absolute top-0 left-0 w-56 h-64 opacity-8 animate-bounce rounded-2xl" style={{
        animationDuration: '4s'
      }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Zhongli_%28Genshin_Impact%29.jpg/500px-Zhongli_%28Genshin_Impact%29.jpg" alt="钟离" className="w-full h-full object-cover rounded-2xl" />
        </div>
        
        {/* 芙宁娜 - 右上角 */}
        <div className="absolute top-10 right-0 w-48 h-56 opacity-8 animate-pulse rounded-2xl" style={{
        animationDelay: '0.5s'
      }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Raiden_Shogun_%28Genshin_Impact%29.jpg/500px-Raiden_Shogun_%28Genshin_Impact%29.jpg" alt="芙宁娜" className="w-full h-full object-cover rounded-2xl" />
        </div>
        
        {/* 纳西妲 - 左下角 */}
        <div className="absolute bottom-0 left-10 w-40 h-48 opacity-8 animate-pulse rounded-2xl" style={{
        animationDelay: '1s'
      }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Nahida_%28Genshin_Impact%29.jpg/500px-Nahida_%28Genshin_Impact%29.jpg" alt="纳西妲" className="w-full h-full object-cover rounded-2xl" />
        </div>
        
        {/* 甘雨 - 右下角 */}
        <div className="absolute bottom-10 right-10 w-48 h-56 opacity-8 animate-bounce rounded-2xl" style={{
        animationDelay: '1.5s',
        animationDuration: '5s'
      }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Ganyu_%28Genshin_Impact%29.jpg/500px-Ganyu_%28Genshin_Impact%29.jpg" alt="甘雨" className="w-full h-full object-cover rounded-2xl" />
        </div>
        
        {/* 胡桃 - 中部偏上 */}
        <div className="absolute top-1/4 left-1/4 w-44 h-52 opacity-8 animate-pulse rounded-2xl" style={{
        animationDelay: '2s'
      }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Hu_Tao_%28Genshin_Impact%29.jpg/500px-Hu_Tao_%28Genshin_Impact%29.jpg" alt="胡桃" className="w-full h-full object-cover rounded-2xl" />
        </div>
        
        {/* 可莉 - 中部偏右 */}
        <div className="absolute top-1/3 right-1/4 w-40 h-48 opacity-8 animate-bounce rounded-2xl" style={{
        animationDelay: '2.5s',
        animationDuration: '6s'
      }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Klee_%28Genshin_Impact%29.jpg/500px-Klee_%28Genshin_Impact%29.jpg" alt="可莉" className="w-full h-full object-cover rounded-2xl" />
        </div>

        {/* 漂浮的星星 */}
        <div className="absolute top-20 left-10 animate-pulse">
          <Star size={16} className="text-[#FFB7C5]/40" />
        </div>
        <div className="absolute top-32 right-16 animate-pulse delay-300">
          <Star size={12} className="text-[#87CEEB]/40" />
        </div>
        <div className="absolute bottom-40 left-20 animate-pulse delay-500">
          <Star size={14} className="text-[#98FB98]/40" />
        </div>
        <div className="absolute top-1/2 right-10 animate-pulse delay-200">
          <Sparkles size={18} className="text-[#FFD700]/40" />
        </div>
        <div className="absolute bottom-32 right-1/4 animate-pulse delay-400">
          <Smile size={16} className="text-[#FFB7C5]/30" />
        </div>
        <div className="absolute top-1/4 left-1/4 animate-pulse delay-600">
          <Zap size={14} className="text-[#87CEEB]/30" />
        </div>

        {/* 漂浮的圆圈 */}
        <div className="absolute top-16 left-1/4 w-24 h-24 bg-gradient-to-br from-[#FFB7C5]/20 to-[#FFB7C5]/5 rounded-full animate-bounce" style={{
        animationDuration: '3s'
      }} />
        <div className="absolute bottom-20 right-1/3 w-20 h-20 bg-gradient-to-br from-[#87CEEB]/20 to-[#87CEEB]/5 rounded-full animate-bounce" style={{
        animationDuration: '4s',
        animationDelay: '1s'
      }} />
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-gradient-to-br from-[#98FB98]/20 to-[#98FB98]/5 rounded-full animate-bounce" style={{
        animationDuration: '2.5s',
        animationDelay: '0.5s'
      }} />

        {/* 可爱的装饰元素 */}
        <div className="absolute top-24 right-1/4 text-3xl animate-pulse">🌸</div>
        <div className="absolute bottom-32 left-1/4 text-2xl animate-pulse delay-300">🌺</div>
        <div className="absolute top-2/3 left-10 text-2xl animate-pulse delay-500">💫</div>
        <div className="absolute bottom-16 right-16 text-3xl animate-pulse delay-700">✨</div>
        <div className="absolute top-1/2 right-1/2 text-2xl animate-pulse delay-200">🌟</div>
      </div>

      {/* 主内容卡片 */}
      <div className="bg-white/95 backdrop-blur-xl rounded-[50px] shadow-2xl p-10 max-w-md w-full relative z-10 border-4 border-white overflow-hidden">
        {/* 卡片装饰 */}
        <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-[#FFB7C5] to-[#FF6B6B] rounded-full opacity-80" />
        <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-gradient-to-br from-[#87CEEB] to-[#98FB98] rounded-full opacity-80" />
        
        {/* Logo 区域 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-[#FFB7C5] via-[#FF6B6B] to-[#FFB7C5] shadow-2xl mb-5 animate-bounce" style={{
          animationDuration: '2s'
        }}>
            <Heart size={48} className="text-white fill-white" />
          </div>
          <div className="relative inline-block">
            <h1 className="text-4xl font-bold mb-2" style={{
            fontFamily: 'Fredoka One, cursive',
            color: '#FF6B6B'
          }}>
              粤次元菌
            </h1>
            <span className="absolute -top-3 -right-4 text-2xl">🎀</span>
          </div>
          <p className="text-gray-600 text-base mb-1" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>
            你的二次元温馨家园 ✨
          </p>
          <p className="text-gray-400 text-xs" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>
            在这里找到属于你的二次元小伙伴们吧～
          </p>
        </div>
      
        {/* 功能介绍 */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="text-center p-3 rounded-2xl bg-gradient-to-br from-[#FFB7C5]/20 to-[#FFB7C5]/5 hover:from-[#FFB7C5]/30 hover:to-[#FFB7C5]/10 transition-all duration-300 hover:scale-105">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFB7C5] to-[#FF6B6B] flex items-center justify-center mx-auto mb-2 shadow-lg">
              <Sparkles size={24} className="text-white" />
            </div>
            <p className="text-xs text-gray-700 font-bold" style={{
            fontFamily: 'Fredoka One, cursive'
          }}>
              日常发布
            </p>
            <p className="text-xs text-gray-400 mt-1" style={{
            fontFamily: 'Nunito, sans-serif'
          }}>📸</p>
          </div>
          <div className="text-center p-3 rounded-2xl bg-gradient-to-br from-[#87CEEB]/20 to-[#87CEEB]/5 hover:from-[#87CEEB]/30 hover:to-[#87CEEB]/10 transition-all duration-300 hover:scale-105">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#87CEEB] to-[#98FB98] flex items-center justify-center mx-auto mb-2 shadow-lg">
              <Heart size={24} className="text-white" />
            </div>
            <p className="text-xs text-gray-700 font-bold" style={{
            fontFamily: 'Fredoka One, cursive'
          }}>
              同好交流
            </p>
            <p className="text-xs text-gray-400 mt-1" style={{
            fontFamily: 'Nunito, sans-serif'
          }}>💬</p>
          </div>
          <div className="text-center p-3 rounded-2xl bg-gradient-to-br from-[#98FB98]/20 to-[#98FB98]/5 hover:from-[#98FB98]/30 hover:to-[#98FB98]/10 transition-all duration-300 hover:scale-105">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#98FB98] to-[#FFFACD] flex items-center justify-center mx-auto mb-2 shadow-lg">
              <Smile size={24} className="text-white" />
            </div>
            <p className="text-xs text-gray-700 font-bold" style={{
            fontFamily: 'Fredoka One, cursive'
          }}>
              私信互动
            </p>
            <p className="text-xs text-gray-400 mt-1" style={{
            fontFamily: 'Nunito, sans-serif'
          }}>💌</p>
          </div>
        </div>
      
        {/* 登录按钮 */}
        <Button onClick={handleAnonymousLogin} disabled={loading} className="w-full bg-gradient-to-r from-[#FFB7C5] via-[#FF6B6B] to-[#FFB7C5] text-white rounded-full py-5 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden group" style={{
        fontFamily: 'Fredoka One, cursive'
      }}>
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1s_infinite]" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                登录中...
              </div> : <>
                进入二次元世界
                <ArrowRight size={20} />
              </>}
          </span>
        </Button>
      
        {/* 提示信息 */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <span className="text-xl">🎉</span>
          <p className="text-xs text-gray-400" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>
            点击按钮，开启你的二次元之旅～
          </p>
          <span className="text-xl">🎈</span>
        </div>
      </div>
    </div>;
}