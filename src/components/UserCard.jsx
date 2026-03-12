// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
// @ts-ignore;
import { Heart, MapPin } from 'lucide-react';

export function UserCard({
  user,
  onLike
}) {
  return <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
      {/* 头像区域 */}
      <div className="relative h-48 bg-gradient-to-br from-[#FF6B35] to-[#F7931E] flex items-center justify-center">
        <Avatar className="w-28 h-28 ring-4 ring-white ring-offset-2">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-[#FF6B35] text-white text-3xl">
            {user.name[0]}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* 内容区域 */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-[#2D2D2D] mb-1" style={{
            fontFamily: 'DM Sans, sans-serif'
          }}>
              {user.name}
            </h3>
            <p className="text-[#FF6B35] font-semibold" style={{
            fontFamily: 'DM Sans, sans-serif'
          }}>
              {user.age} 岁
            </p>
          </div>
        </div>

        {user.location && <div className="flex items-center gap-2 text-gray-500 text-sm mb-3" style={{
        fontFamily: 'DM Sans, sans-serif'
      }}>
            <MapPin className="w-4 h-4" />
            <span>{user.location}</span>
          </div>}

        <p className="text-gray-600 text-sm mb-4 line-clamp-2" style={{
        fontFamily: 'DM Sans, sans-serif'
      }}>
          {user.bio}
        </p>

        {/* 兴趣标签 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {user.interests.map((interest, index) => <span key={index} className="px-3 py-1 bg-[#FF6B35]/10 text-[#FF6B35] rounded-full text-xs font-medium" style={{
          fontFamily: 'DM Sans, sans-serif'
        }}>
              {interest}
            </span>)}
        </div>

        {/* 操作按钮 */}
        <Button onClick={() => onLike(user.id)} className="w-full h-10 bg-[#FF6B35] hover:bg-[#F7931E] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group-hover:bg-[#F7931E]" style={{
        fontFamily: 'DM Sans, sans-serif'
      }}>
          <Heart className="w-4 h-4" />
          喜欢
        </Button>
      </div>
    </div>;
}