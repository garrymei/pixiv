// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Heart, Star, Sparkles, Zap, Wand2, Crown, Swords, Shield, MapPin } from 'lucide-react';

import { AnimeEffects } from './AnimeEffects';

/**
 * 海报风格封面组件 - 简化版
 * 融合原神、王者荣耀等动漫游戏角色元素
 * 现在主要用于其他页面的装饰
 */
export function PosterCover() {
  return <div className="relative w-full h-full min-h-screen overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
      {/* 动漫特效 */}
      <AnimeEffects type="magic" intensity="high" />
      
      {/* 背景层1 - 渐变光晕 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '1s'
      }} />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '2s'
      }} />
      </div>

      {/* 背景层2 - 游戏角色图片（原神） */}
      <div className="absolute inset-0 opacity-30">
        {/* 胡桃 - 左侧 */}
        <div className="absolute top-20 left-0 w-64 h-80 animate-bounce" style={{
        animationDuration: '4s'
      }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Hu_Tao_%28Genshin_Impact%29.jpg/440px-Hu_Tao_%28Genshin_Impact%29.jpg" alt="胡桃" className="w-full h-full object-cover rounded-t-full" />
        </div>

        {/* 雷电将军 - 右上 */}
        <div className="absolute top-0 right-0 w-72 h-96 animate-pulse" style={{
        animationDelay: '0.5s'
      }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Raiden_Shogun_%28Genshin_Impact%29.jpg/500px-Raiden_Shogun_%28Genshin_Impact%29.jpg" alt="雷电将军" className="w-full h-full object-cover" />
        </div>

        {/* 钟离 - 右侧 */}
        <div className="absolute top-1/3 right-10 w-64 h-80 animate-bounce" style={{
        animationDelay: '1.5s',
        animationDuration: '5s'
      }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Zhongli_%28Genshin_Impact%29.jpg/440px-Zhongli_%28Genshin_Impact%29.jpg" alt="钟离" className="w-full h-full object-cover" />
        </div>

        {/* 甘雨 - 左下 */}
        <div className="absolute bottom-0 left-10 w-64 h-80 animate-pulse" style={{
        animationDelay: '2s'
      }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Ganyu_%28Genshin_Impact%29.jpg/440px-Ganyu_%28Genshin_Impact%29.jpg" alt="甘雨" className="w-full h-full object-cover" />
        </div>

        {/* 纳西妲 - 中部 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-72 animate-bounce" style={{
        animationDelay: '2.5s',
        animationDuration: '6s'
      }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Nahida_%28Genshin_Impact%29.jpg/440px-Nahida_%28Genshin_Impact%29.jpg" alt="纳西妲" className="w-full h-full object-cover rounded-full" />
        </div>

        {/* 可莉 - 右下 */}
        <div className="absolute bottom-0 right-0 w-56 h-72 animate-bounce" style={{
        animationDelay: '3s',
        animationDuration: '4s'
      }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Klee_%28Genshin_Impact%29.jpg/440px-Klee_%28Genshin_Impact%29.jpg" alt="可莉" className="w-full h-full object-cover rounded-t-full" />
        </div>
      </div>

      {/* 背景层3 - 装饰元素 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 漂浮的星星 */}
        <div className="absolute top-20 left-10 animate-pulse">
          <Star size={16} className="text-yellow-300/40" />
        </div>
        <div className="absolute top-32 right-20 animate-pulse delay-300">
          <Star size={12} className="text-pink-300/40" />
        </div>
        <div className="absolute bottom-40 left-20 animate-pulse delay-500">
          <Star size={14} className="text-blue-300/40" />
        </div>
        <div className="absolute top-1/2 right-10 animate-pulse delay-200">
          <Sparkles size={18} className="text-yellow-300/40" />
        </div>
        <div className="absolute bottom-32 right-1/4 animate-pulse delay-400">
          <Heart size={16} className="text-pink-300/30" />
        </div>
        <div className="absolute top-1/4 left-1/4 animate-pulse delay-600">
          <Zap size={14} className="text-blue-300/30" />
        </div>

        {/* 漂浮的圆圈 */}
        <div className="absolute top-16 left-1/4 w-24 h-24 bg-gradient-to-br from-purple-300/20 to-purple-300/5 rounded-full animate-bounce" style={{
        animationDuration: '3s'
      }} />
        <div className="absolute bottom-20 right-1/3 w-20 h-20 bg-gradient-to-br from-blue-300/20 to-blue-300/5 rounded-full animate-bounce" style={{
        animationDuration: '4s',
        animationDelay: '1s'
      }} />
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-gradient-to-br from-pink-300/20 to-pink-300/5 rounded-full animate-bounce" style={{
        animationDuration: '2.5s',
        animationDelay: '0.5s'
      }} />

        {/* 游戏主题装饰 */}
        <div className="absolute top-24 right-1/4 text-3xl animate-pulse">🎮</div>
        <div className="absolute bottom-32 left-1/4 text-2xl animate-pulse delay-300">⚔️</div>
        <div className="absolute top-2/3 left-10 text-2xl animate-pulse delay-500">✨</div>
        <div className="absolute bottom-16 right-16 text-3xl animate-pulse delay-700">🎯</div>
        <div className="absolute top-1/2 right-1/2 text-2xl animate-pulse delay-200">🏆</div>
      </div>

      {/* 底部渐变 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f3460] to-transparent" />
    </div>;
}