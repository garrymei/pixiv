// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Home, Pen, Message, User, Sparkles } from 'lucide-react';

export function BottomNav({
  $w,
  currentPage
}) {
  const {
    navigateTo
  } = $w.utils;
  const navItems = [{
    id: 'home',
    icon: Home,
    label: '首页',
    pageId: 'home',
    emoji: '🏠'
  }, {
    id: 'posts',
    icon: Pen,
    label: '发布',
    pageId: 'posts',
    emoji: '✏️'
  }, {
    id: 'messages',
    icon: Message,
    label: '消息',
    pageId: 'messages',
    emoji: '💬'
  }, {
    id: 'profile',
    icon: User,
    label: '我的',
    pageId: 'profile',
    emoji: '👤'
  }];
  return <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t-2 border-[#FFB7C5]/30 shadow-2xl z-50">
      <div className="max-w-md mx-auto px-2 py-3 relative">
        {/* 装饰性背景元素 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-[#FFB7C5]/20 to-[#87CEEB]/20 rounded-full opacity-50" />
        <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-[#FFB7C5]/10 to-[#87CEEB]/10 rounded-full opacity-30" />
        <div className="absolute top-1/2 right-1/4 transform translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-[#98FB98]/10 to-[#FFB7C5]/10 rounded-full opacity-30" />
        
        <div className="flex justify-around items-center relative z-10">
          {navItems.map(item => {
          const isActive = currentPage === item.pageId;
          const Icon = item.icon;
          return <button key={item.id} onClick={() => navigateTo({
            pageId: item.pageId
          })} className={`flex flex-col items-center gap-1 transition-all duration-500 ${isActive ? 'scale-110 -translate-y-2' : 'scale-100 hover:scale-105'}`}>
                <div className={`relative transition-all duration-500 ${isActive ? 'p-3 rounded-full' : 'p-2'}`}>
                  {isActive && <div className="absolute inset-0 bg-gradient-to-br from-[#FFB7C5] to-[#FF6B6B] rounded-full animate-pulse" />}
                  <div className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isActive ? 'bg-gradient-to-br from-[#FFB7C5] to-[#FF6B6B]' : 'bg-gradient-to-br from-[#87CEEB]/20 to-[#98FB98]/20 hover:from-[#87CEEB]/30 hover:to-[#98FB98]/30'}`}>
                    <Icon size={22} className={`${isActive ? 'text-white' : 'text-[#87CEEB]'}`} />
                  </div>
                  {isActive && <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center shadow-md">
                      <Sparkles size={8} className="text-white" />
                    </div>}
                </div>
                <span className={`text-xs font-bold transition-all duration-300 ${isActive ? 'text-[#FF6B6B]' : 'text-gray-400'}`} style={{
              fontFamily: 'Fredoka One, cursive'
            }}>
                  {item.label}
                </span>
              </button>;
        })}
        </div>
      </div>
    </div>;
}