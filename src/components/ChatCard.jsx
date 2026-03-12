// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';

export function ChatCard({
  chat,
  onClick
}) {
  return <div onClick={() => onClick?.(chat.id)} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-4 mb-3 cursor-pointer hover:scale-[1.02]">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="w-14 h-14 ring-2 ring-[#FFB7C5] ring-offset-2">
            <AvatarImage src={chat.avatar} alt={chat.name} />
            <AvatarFallback className="bg-gradient-to-br from-[#FFB7C5] to-[#87CEEB] text-white text-xl">
              {chat.name[0]}
            </AvatarFallback>
          </Avatar>
          {chat.online && <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-800" style={{
            fontFamily: 'Fredoka One, cursive'
          }}>
              {chat.name}
            </h3>
            <span className="text-xs text-gray-400">
              {chat.time}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-1" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>
            {chat.lastMessage}
          </p>
        </div>
        
        {chat.unreadCount > 0 && <div className="w-6 h-6 bg-[#FF6B6B] rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">
              {chat.unreadCount}
            </span>
          </div>}
      </div>
    </div>;
}