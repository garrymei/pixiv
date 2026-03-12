// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
// @ts-ignore;
import { Heart, MessageCircle, MapPin } from 'lucide-react';

export function PostCard({
  post,
  onLike,
  onComment
}) {
  return <div className="bg-white rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 mb-6 overflow-hidden">
      {/* 用户信息 */}
      <div className="p-4 flex items-center gap-3">
        <Avatar className="w-12 h-12 ring-2 ring-[#FFB7C5] ring-offset-2">
          <AvatarImage src={post.avatar} alt={post.name} />
          <AvatarFallback className="bg-[#FFB7C5] text-white text-lg">
            {post.name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800" style={{
          fontFamily: 'Fredoka One, cursive'
        }}>
            {post.name}
          </h3>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <MapPin size={10} />
            {post.location}
          </p>
        </div>
        <span className="text-xs text-gray-400">
          {post.time}
        </span>
      </div>

      {/* 内容 */}
      <div className="px-4 pb-3">
        <p className="text-gray-700 leading-relaxed mb-3" style={{
        fontFamily: 'Nunito, sans-serif'
      }}>
          {post.content}
        </p>
        
        {post.image && <div className="rounded-2xl overflow-hidden mb-3">
            <img src={post.image} alt="动态图片" className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300" />
          </div>}
        
        {/* 标签 */}
        {post.tags && post.tags.length > 0 && <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-gradient-to-r from-[#FFB7C5] to-[#87CEEB] text-white rounded-full text-xs font-medium">
                #{tag}
              </span>)}
          </div>}
      </div>

      {/* 互动按钮 */}
      <div className="px-4 pb-4 flex items-center gap-6">
        <button onClick={() => onLike?.(post.id)} className={`flex items-center gap-2 transition-all duration-300 ${post.isLiked ? 'text-[#FF6B6B]' : 'text-gray-500'}`}>
          <Heart size={20} className={post.isLiked ? 'fill-[#FF6B6B]' : ''} />
          <span className="text-sm font-medium">{post.likeCount}</span>
        </button>
        
        <button onClick={() => onComment?.(post.id)} className="flex items-center gap-2 text-gray-500 hover:text-[#87CEEB] transition-all duration-300">
          <MessageCircle size={20} />
          <span className="text-sm font-medium">{post.commentCount}</span>
        </button>
      </div>
    </div>;
}