// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
// @ts-ignore;
import { Heart, MessageCircle, MapPin, Star, Sparkles } from 'lucide-react';

export function PostCard({
  post,
  onLike,
  onComment
}) {
  return <div className="bg-white/95 backdrop-blur-xl rounded-[32px] shadow-xl hover:shadow-2xl transition-all duration-500 mb-6 overflow-hidden border-2 border-white hover:scale-[1.02]">
      {/* 用户信息 */}
      <div className="p-5 flex items-center gap-4">
        <div className="relative">
          <Avatar className="w-14 h-14 ring-3 ring-[#FFB7C5] ring-offset-3 shadow-lg">
            <AvatarImage src={post.avatar} alt={post.name} />
            <AvatarFallback className="bg-gradient-to-br from-[#FFB7C5] to-[#87CEEB] text-white text-xl font-bold" style={{
            fontFamily: 'Fredoka One, cursive'
          }}>
              {post.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center shadow-md">
            <Sparkles size={10} className="text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 text-lg" style={{
          fontFamily: 'Fredoka One, cursive'
        }}>
            {post.name}
          </h3>
          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
            <MapPin size={11} className="text-[#FF6B6B]" />
            {post.location}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400 font-medium" style={{
          fontFamily: 'Nunito, sans-serif'
        }}>
            {post.time}
          </span>
          <div className="flex justify-end mt-1">
            <span className="text-xs">💫</span>
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="px-5 pb-4">
        <p className="text-gray-700 leading-relaxed mb-4 text-base" style={{
        fontFamily: 'Nunito, sans-serif'
      }}>
          {post.content}
        </p>
        
        {post.image && <div className="rounded-3xl overflow-hidden mb-4 shadow-lg">
            <img src={post.image} alt="动态图片" className="w-full h-72 object-cover hover:scale-110 transition-transform duration-500" />
          </div>}
        
        {/* 标签 */}
        {post.tags && post.tags.length > 0 && <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => <span key={index} className="px-4 py-2 bg-gradient-to-r from-[#FFB7C5]/30 via-[#87CEEB]/20 to-[#98FB98]/30 text-gray-700 rounded-full text-xs font-bold shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105" style={{
          fontFamily: 'Fredoka One, cursive'
        }}>
                #{tag}
              </span>)}
          </div>}
      </div>

      {/* 互动按钮 */}
      <div className="px-5 pb-5 flex items-center gap-6">
        <button onClick={() => onLike?.(post.id)} className={`flex items-center gap-2.5 transition-all duration-300 hover:scale-110 ${post.isLiked ? 'text-[#FF6B6B]' : 'text-gray-500'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${post.isLiked ? 'bg-gradient-to-br from-[#FFB7C5] to-[#FF6B6B] shadow-lg' : 'bg-gray-100'}`}>
            <Heart size={18} className={post.isLiked ? 'fill-white' : ''} />
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
    </div>;
}