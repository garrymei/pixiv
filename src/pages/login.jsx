// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Heart, Sparkles, ArrowRight } from 'lucide-react';

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
        title: '登录成功',
        description: '欢迎来到二次元交流平台！✨'
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
        title: '登录失败',
        description: error.message || '登录时发生错误'
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-[#FFB7C5]/30 via-[#87CEEB]/30 to-[#98FB98]/30 flex items-center justify-center p-4 overflow-hidden relative">
      {/* 装饰性背景元素 */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-[#FFB7C5]/20 rounded-full animate-pulse" />
      <div className="absolute top-20 right-20 w-16 h-16 bg-[#87CEEB]/20 rounded-full animate-pulse delay-100" />
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-[#98FB98]/20 rounded-full animate-pulse delay-200" />
      <div className="absolute bottom-10 right-10 w-14 h-14 bg-[#FFFACD]/30 rounded-full animate-pulse delay-300" />
      <div className="absolute top-1/3 left-1/4 w-8 h-8 bg-[#E6E6FA]/30 rounded-full" />
      <div className="absolute top-2/3 right-1/4 w-12 h-12 bg-[#FF6B6B]/20 rounded-full" />
      
      {/* 主内容卡片 */}
      <div className="bg-white/90 backdrop-blur-md rounded-[40px] shadow-2xl p-8 max-w-md w-full relative z-10 border-4 border-white">
        {/* Logo 区域 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#FFB7C5] to-[#FF6B6B] shadow-lg mb-4 animate-bounce">
            <Heart size={36} className="text-white fill-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{
          fontFamily: 'Fredoka One, cursive',
          color: '#FF6B6B'
        }}>
            二次元交流平台
          </h1>
          <p className="text-gray-600 text-sm" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>
            分享你的二次元生活 ✨
          </p>
        </div>
      
        {/* 功能介绍 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFB7C5]/20 to-[#FFB7C5]/40 flex items-center justify-center mx-auto mb-2">
              <Sparkles size={20} className="text-[#FF6B6B]" />
            </div>
            <p className="text-xs text-gray-600 font-medium" style={{
            fontFamily: 'Nunito, sans-serif'
          }}>
              日常发布
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#87CEEB]/20 to-[#87CEEB]/40 flex items-center justify-center mx-auto mb-2">
              <Heart size={20} className="text-[#87CEEB]" />
            </div>
            <p className="text-xs text-gray-600 font-medium" style={{
            fontFamily: 'Nunito, sans-serif'
          }}>
              同好交流
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#98FB98]/20 to-[#98FB98]/40 flex items-center justify-center mx-auto mb-2">
              <Sparkles size={20} className="text-[#98FB98]" />
            </div>
            <p className="text-xs text-gray-600 font-medium" style={{
            fontFamily: 'Nunito, sans-serif'
          }}>
              私信互动
            </p>
          </div>
        </div>
      
        {/* 登录按钮 */}
        <Button onClick={handleAnonymousLogin} disabled={loading} className="w-full bg-gradient-to-r from-[#FFB7C5] via-[#FF6B6B] to-[#FFB7C5] text-white rounded-full py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden" style={{
        fontFamily: 'Fredoka One, cursive'
      }}>
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? '登录中...' : <>
                匿名登录
                <ArrowRight size={18} />
              </>}
          </span>
        </Button>
      
        {/* 提示信息 */}
        <p className="text-center text-xs text-gray-400 mt-6" style={{
        fontFamily: 'Nunito, sans-serif'
      }}>
          点击登录即可体验完整功能
        </p>
      </div>
    </div>;
}