// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Home, Pen, Message, User } from 'lucide-react';

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
    pageId: 'home'
  }, {
    id: 'posts',
    icon: Pen,
    label: '发布',
    pageId: 'posts'
  }, {
    id: 'messages',
    icon: Message,
    label: '消息',
    pageId: 'messages'
  }, {
    id: 'profile',
    icon: User,
    label: '我的',
    pageId: 'profile'
  }];
  return <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-[#FFB7C5]/30 shadow-lg z-50">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex justify-around items-center">
          {navItems.map(item => {
          const isActive = currentPage === item.pageId;
          const Icon = item.icon;
          return <button key={item.id} onClick={() => navigateTo({
            pageId: item.pageId
          })} className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                <div className={`p-2 rounded-full transition-all duration-300 ${isActive ? 'bg-[#FFB7C5] text-white' : 'bg-transparent text-[#87CEEB]'}`}>
                  <Icon size={20} />
                </div>
                <span className={`text-xs font-medium transition-all duration-300 ${isActive ? 'text-[#FFB7C5]' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </button>;
        })}
        </div>
      </div>
    </div>;
}