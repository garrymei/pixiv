// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Heart, Star, Sparkles, Zap, Wand2, Crown, Swords, Shield, MapPin } from 'lucide-react';

import { AnimeEffects } from './AnimeEffects';

/**
 * 海报风格封面组件
 * 融合原神、王者荣耀等动漫游戏角色元素
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
        <div className="absolute bottom-0 left-0 w-56 h-72 animate-pulse" style={{
        animationDelay: '2s'
      }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Ganyu_%28Genshin_Impact%29.jpg/440px-Ganyu_%28Genshin_Impact%29.jpg" alt="甘雨" className="w-full h-full object-cover" />
        </div>

        {/* 纳西妲 - 中部 */}
        <div className="absolute top-1/2 left-1/4 w-48 h-60 animate-bounce" style={{
        animationDelay: '2.5s',
        animationDuration: '6s'
      }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Nahida_%28Genshin_Impact%29.jpg/440px-Nahida_%28Genshin_Impact%29.jpg" alt="纳西妲" className="w-full h-full object-cover" />
        </div>

        {/* 可莉 - 右下 */}
        <div className="absolute bottom-10 right-0 w-48 h-56 animate-pulse" style={{
        animationDelay: '3s'
      }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Klee_%28Genshin_Impact%29.jpg/440px-Klee_%28Genshin_Impact%29.jpg" alt="可莉" className="w-full h-full object-cover rounded-b-full" />
        </div>
      </div>

      {/* 背景层3 - 装饰元素 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 星星 */}
        {[...Array(20)].map((_, i) => <div key={`star-${i}`} className="absolute animate-pulse" style={{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        opacity: 0.4
      }}>
            <Star size={12 + Math.random() * 8} className={`fill-white text-${['purple', 'blue', 'pink', 'yellow'][i % 4]}-${400 + i % 2 * 200}`} />
          </div>)}

        {/* 闪电 */}
        {[...Array(8)].map((_, i) => <div key={`zap-${i}`} className="absolute animate-pulse" style={{
        top: `${10 + i * 12}%`,
        left: `${5 + i * 10}%`,
        animationDelay: `${i * 0.4}s`,
        opacity: 0.3
      }}>
            <Zap size={16} className="text-yellow-400" />
          </div>)}

        {/* 火花 */}
        <div className="absolute top-1/4 right-1/4 animate-bounce" style={{
        animationDuration: '3s'
      }}>
          <Sparkles size={24} className="text-pink-400 opacity-50" />
        </div>
        <div className="absolute bottom-1/3 left-1/3 animate-bounce" style={{
        animationDuration: '4s',
        animationDelay: '1s'
      }}>
          <Sparkles size={20} className="text-blue-400 opacity-50" />
        </div>
        <div className="absolute top-1/2 right-1/3 animate-bounce" style={{
        animationDuration: '3.5s',
        animationDelay: '2s'
      }}>
          <Sparkles size={22} className="text-purple-400 opacity-50" />
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-8 z-10">
          {/* 主标题 */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center gap-4 mb-4">
              <Crown size={32} className="text-yellow-400 animate-pulse" />
              <h1 className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400" style={{
              fontFamily: 'Fredoka One, cursive'
            }}>
                粤次元菌
              </h1>
              <Crown size={32} className="text-yellow-400 animate-pulse" style={{
              animationDelay: '0.5s'
            }} />
            </div>
            
            {/* 副标题装饰 */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-24 h-1 bg-gradient-to-r from-transparent to-pink-400" />
              <Heart size={24} className="text-pink-400 fill-pink-400 animate-pulse" />
              <div className="w-24 h-1 bg-gradient-to-l from-transparent to-pink-400" />
            </div>

            {/* 副标题 */}
            <p className="text-2xl text-white/90 mb-3" style={{
            fontFamily: 'Nunito, sans-serif'
          }}>
              你的二次元温馨家园 ✨
            </p>
            <p className="text-lg text-white/70" style={{
            fontFamily: 'Nunito, sans-serif'
          }}>
              与千万玩家一起探索动漫世界
            </p>
          </div>

          {/* 特色图标 */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Swords size={36} className="text-white" />
              </div>
              <p className="text-white/80 text-sm font-bold">角色扮演</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Wand2 size={36} className="text-white" />
              </div>
              <p className="text-white/80 text-sm font-bold">魔法冒险</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Shield size={36} className="text-white" />
              </div>
              <p className="text-white/80 text-sm font-bold">社区互动</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <MapPin size={36} className="text-white" />
              </div>
              <p className="text-white/80 text-sm font-bold">世界探索</p>
            </div>
          </div>

          {/* 游戏标签 */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-lg">
              原神
            </span>
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold shadow-lg">
              王者荣耀
            </span>
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold shadow-lg">
              原神社区
            </span>
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold shadow-lg">
              二次元
            </span>
          </div>

          {/* 装饰元素 */}
          <div className="flex items-center justify-center gap-4 text-3xl">
            <span className="animate-bounce" style={{
            animationDuration: '2s'
          }}>🎮</span>
            <span className="animate-pulse" style={{
            animationDelay: '0.5s'
          }}>⚔️</span>
            <span className="animate-bounce" style={{
            animationDuration: '2.5s',
            animationDelay: '1s'
          }}>✨</span>
            <span className="animate-pulse" style={{
            animationDelay: '1.5s'
          }}>🎯</span>
            <span className="animate-bounce" style={{
            animationDuration: '3s',
            animationDelay: '2s'
          }}>🏆</span>
          </div>
        </div>
      </div>

      {/* 底部渐变 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f3460] to-transparent" />
    </div>;
}