// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Bell, X } from 'lucide-react';

import { ChatCard } from '@/components/ChatCard';
import { BottomNav } from '@/components/BottomNav';
export default function Messages({
  $w
}) {
  const {
    toast
  } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = $w.auth.currentUser || {};
  const mockChats = [{
    id: 'chat_1',
    name: '小樱花',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    lastMessage: '今天的cosplay好可爱呀！🎀',
    time: '2分钟前',
    unreadCount: 3,
    online: true
  }, {
    id: 'chat_2',
    name: '星空猫',
    avatar: 'https://images.unsplash.com/photo-1527003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    lastMessage: '一起去漫展吧！',
    time: '30分钟前',
    unreadCount: 1,
    online: false
  }, {
    id: 'chat_3',
    name: '薄荷糖',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    lastMessage: '收到啦～谢谢！',
    time: '1小时前',
    unreadCount: 0,
    online: true
  }, {
    id: 'chat_4',
    name: '彩虹酱',
    avatar: 'https://images.unsplash.com/photo-1438761689735-6d2451b95e6a?w=200&h=200&fit=crop',
    lastMessage: '下次一起玩游戏吧',
    time: '3小时前',
    unreadCount: 0,
    online: false
  }];
  useEffect(() => {
    const timer = setTimeout(() => {
      setChats(mockChats);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  const filteredChats = chats.filter(chat => {
    return chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
  });
  const handleChatClick = chatId => {
    // 跳转到聊天详情页（待实现）
    toast({
      title: '聊天功能',
      description: '聊天详情页正在开发中'
    });
  };
  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);
  return <div className="min-h-screen bg-gradient-to-br from-[#FFB7C5]/10 via-[#87CEEB]/10 to-[#98FB98]/10 pb-24">
      {/* 头部 */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#FFB7C5]/20">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold" style={{
            fontFamily: 'Fredoka One, cursive',
            color: '#FF6B6B'
          }}>
              消息
            </h1>
            {totalUnread > 0 && <div className="flex items-center gap-2">
                <Bell size={18} className="text-[#FF6B6B] animate-pulse" />
                <span className="text-xs text-[#FF6B6B] font-bold">
                  {totalUnread}未读
                </span>
              </div>}
          </div>
          
          {/* 搜索框 */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="搜索聊天记录..." className="w-full pl-10 pr-4 py-2 bg-[#FFB7C5]/10 rounded-full border border-[#FFB7C5]/30 focus:border-[#FF6B6B] focus:outline-none text-sm transition-all duration-300" style={{
            fontFamily: 'Nunito, sans-serif'
          }} />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>}
          </div>
        </div>
      </header>
      
      {/* 主要内容 */}
      <main className="max-w-md mx-auto px-4 py-6">
        {loading ? <div className="flex items-center justify-center py-8">
            <div className="text-gray-500 text-sm">加载中...</div>
          </div> : filteredChats.length > 0 ? <div className="space-y-2">
            {filteredChats.map(chat => <ChatCard key={chat.id} chat={chat} onClick={handleChatClick} />)}
          </div> : <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#FFB7C5]/20 flex items-center justify-center mb-4">
              <Bell size={32} className="text-[#FFB7C5]/50" />
            </div>
            <p className="text-gray-600 text-sm mb-2" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>
              {searchQuery ? '没有找到相关聊天' : '还没有消息哦～'}
            </p>
            <p className="text-gray-400 text-xs" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>
              {searchQuery ? '试试搜索其他关键词' : '快去认识新朋友吧！✨'}
            </p>
          </div>}
      </main>
      
      <BottomNav $w={$w} currentPage="messages" />
    </div>;
}