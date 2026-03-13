// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
// @ts-ignore;
import { Heart, MessageCircle, MapPin, Star, Sparkles } from 'lucide-react';

import { EffectTrigger } from '@/components/AnimeEffects';
export function PostCard({
  post,
  onLike,
  onComment
}) {
  const [showLikeEffect, setShowLikeEffect] = useState(false);

  // 处理点赞时的特效
  const handleLikeClick = () => {
    if (onLike) {
      onLike(post.id);
      // 触发爱心特效
      setShowLikeEffect(true);
      setTimeout(() => setShowLikeEffect(false), 2000);
    }
  };
  return <>
      <div className="bg-white/95 backdrop-blur-xl rounded-[32px] shadow-xl hover:shadow-2xl transition-all duration-500 mb-6 overflow-hidden border-2 border-white hover:scale-[1.02]">
        {/* 用户信息 */}
        <div className="p-5 flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-14 h-14 ring-3 ring-[#FFB7C5] ring-offset-3 shadow-lg">
              <AvatarImage src={post.avatar} alt={post.name} />
              <AvatarFallback className="bg-gradient-to-br from-[#FFB7C5] to-[#87CEEB] text-white text-xl font-bold" style={{
              fontFamily: 'Fredoka One, cursive'
            }}>
                {post.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {/* 装饰性星星 */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center animate-pulse shadow-lg">
              <Star size={12} className="text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 text-lg" style={{
            fontFamily: 'Fredoka One, cursive'
          }}>
              {post.name}
            </h3>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <MapPin size={14} className="text-[#87CEEB]" />
              <span>{post.location}</span>
              <span className="text-gray-300">•</span>
              <span>{post.time}</span>
            </div>
          </div>
          
          {/* 推荐标签 */}
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Star size={12} className="text-[#FFD700]" />
            <span>推荐</span>
          </div>
        </div>
        
        {/* 内容 */}
        <div className="px-5 pb-4">
          <p className="text-gray-700 leading-relaxed mb-4" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>
            {post.content}
          </p>
          
          {/* 标签 */}
          {post.tags && post.tags.length > 0 && <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-gradient-to-r from-[#FFB7C5]/20 to-[#87CEEB]/20 text-gray-600 text-xs rounded-full border border-[#FFB7C5]/30 hover:from-[#FFB7C5]/30 hover:to-[#87CEEB]/30 transition-all duration-300 cursor-pointer hover:scale-105">
                #{tag}
              </span>)}
          </div>}
          
          {/* 图片 */}
          {post.image && <div className="mb-4">
              <img src={post.image} alt="动态图片" className="w-full h-64 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]" />
            </div>}
        </div>
        
        {/* 互动区域 */}
        <div className="px-5 pb-5 flex items-center justify-between">
          <button onClick={handleLikeClick} className={`flex items-center gap-2.5 transition-all duration-300 hover:scale-110 ${post.isLiked ? 'text-[#FF6B6B]' : 'text-gray-500 hover:text-[#FF6B6B]'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:shadow-lg ${post.isLiked ? 'bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] shadow-lg' : 'bg-gray-100 hover:bg-gradient-to-br hover:from-[#FF6B6B] hover:to-[#FF8E8E]'}`}>
              <Heart size={18} className={post.isLiked ? 'fill-white text-white' : ''} />
            </div>
            <span className="text-sm font-bold" style={{
            fontFamily: 'Fredoka One, cursive'
          }}>{post.likeCount}</span>
          </button>
          
          <button onClick={() => onComment?.(post.id)} className="flex items-center gap-2.5 text-gray-500 hover:text-[#87CEEB] transition-all duration-300 hover:scale-110">
            <div className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gradient-to-br hover:from-[#87CEEB] hover:to-[#98FB98] flex items-center justify-center transition-all duration-300 hover:shadow-lg">
              <MessageCircle size={18} />
            </div>
            <span className="text-sm font-bold" style={{
            fontFamily: 'Fredoka One, cursive'
          }}>{post.commentCount}</span>
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Star size={12} className="text-[#FFD700]" />
            <span>推荐</span>
          </div>
        </div>
      </div>
      
      {/* 点赞特效 */}
      {showLikeEffect && <EffectTrigger type="love" position="center" />}
    </>;
}