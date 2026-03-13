// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowRight, Sparkles, Heart } from 'lucide-react';

// @ts-ignore;
import { PosterCover } from '@/components/PosterCover';
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
        title: '欢迎回来～ 🎮',
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
  return <div className="relative min-h-screen">
      {/* 海报背景 */}
      <PosterCover />
      
      {/* 登录卡片 */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
        <div className="bg-white/95 backdrop-blur-xl rounded-[32px] p-6 shadow-2xl border-2 border-white/20">
          {/* Logo 区域 */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 shadow-xl mb-3 animate-bounce" style={{
            animationDuration: '2s'
          }}>
              <Heart size={36} className="text-white fill-white" />
            </div>
            <h1 className="text-3xl font-bold mb-1" style={{
            fontFamily: 'Fredoka One, cursive',
            color: '#FF6B6B'
          }}>
              粤次元菌
            </h1>
            <p className="text-gray-600 text-sm" style={{
            fontFamily: 'Nunito, sans-serif'
          }}>
              开启你的二次元冒险之旅
            </p>
          </div>
          
          {/* 登录按钮 */}
          <Button onClick={handleAnonymousLogin} disabled={loading} className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white rounded-2xl py-4 text-base font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden group" style={{
          fontFamily: 'Fredoka One, cursive'
        }}>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1s_infinite]" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  登录中...
                </div> : <>
                  开始冒险
                  <ArrowRight size={20} />
                </>}
            </span>
          </Button>
          
          {/* 提示信息 */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <Sparkles size={14} className="text-pink-500" />
            <p className="text-xs text-gray-500" style={{
            fontFamily: 'Nunito, sans-serif'
          }}>
              点击按钮，探索二次元世界
            </p>
            <Sparkles size={14} className="text-purple-500" />
          </div>
        </div>
      </div>
    </div>;
}