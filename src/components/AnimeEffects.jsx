// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Sparkles, Star, Zap, Heart, Music, Wind, Flame, Snowflake, Sun, Moon } from 'lucide-react';

/**
 * 动漫特效组件
 * 提供各种炫酷的动漫风格特效
 */
export function AnimeEffects({
  type = 'default',
  intensity = 'medium'
}) {
  const [particles, setParticles] = useState([]);
  const [lightning, setLightning] = useState([]);
  const [magicCircles, setMagicCircles] = useState([]);

  // 粒子效果
  useEffect(() => {
    const interval = setInterval(() => {
      const newParticle = {
        id: Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 2,
        color: ['#FFB7C5', '#87CEEB', '#98FB98', '#FFD700', '#FF6B6B'][Math.floor(Math.random() * 5)],
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2
      };
      setParticles(prev => [...prev.slice(-20), newParticle]);
    }, intensity === 'high' ? 200 : intensity === 'medium' ? 500 : 1000);
    return () => clearInterval(interval);
  }, [intensity]);

  // 闪电效果
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newLightning = {
          id: Math.random(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          duration: 0.3,
          delay: Math.random() * 2
        };
        setLightning(prev => [...prev.slice(-5), newLightning]);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // 魔法阵效果
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newCircle = {
          id: Math.random(),
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
          size: Math.random() * 100 + 50,
          duration: 4,
          delay: Math.random() * 3
        };
        setMagicCircles(prev => [...prev.slice(-3), newCircle]);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 根据类型返回不同的特效
  const renderEffects = () => {
    switch (type) {
      case 'magic':
        return <>
            {/* 魔法粒子 */}
            {particles.map(particle => <div key={particle.id} className="absolute animate-ping" style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`
          }}>
                <div className="rounded-full" style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
            }} />
              </div>)}

            {/* 魔法阵 */}
            {magicCircles.map(circle => <div key={circle.id} className="absolute animate-spin" style={{
            left: `${circle.x}%`,
            top: `${circle.y}%`,
            width: `${circle.size}px`,
            height: `${circle.size}px`,
            animationDuration: `${circle.duration}s`,
            animationDelay: `${circle.delay}s`
          }}>
                <div className="w-full h-full border-2 border-purple-400/30 rounded-full" />
                <div className="absolute inset-2 border-2 border-blue-400/20 rounded-full" />
                <div className="absolute inset-4 border-2 border-pink-400/10 rounded-full" />
                <Star className="absolute top-0 left-1/2 transform -translate-x-1/2 text-purple-400/40" size={16} />
                <Sparkles className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-blue-400/40" size={16} />
              </div>)}

            {/* 魔法符号 */}
            <div className="absolute top-10 left-10 animate-pulse">
              <Wind className="text-blue-400/40" size={24} />
            </div>
            <div className="absolute top-20 right-20 animate-pulse delay-300">
              <Flame className="text-red-400/40" size={20} />
            </div>
            <div className="absolute bottom-20 left-20 animate-pulse delay-500">
              <Snowflake className="text-cyan-400/40" size={22} />
            </div>
            <div className="absolute bottom-10 right-10 animate-pulse delay-700">
              <Sun className="text-yellow-400/40" size={26} />
            </div>
          </>;
      case 'lightning':
        return <>
            {/* 闪电效果 */}
            {lightning.map(bolt => <div key={bolt.id} className="absolute animate-pulse" style={{
            left: `${bolt.x}%`,
            top: `${bolt.y}%`,
            animationDuration: `${bolt.duration}s`,
            animationDelay: `${bolt.delay}s`
          }}>
                <Zap className="text-yellow-400" size={32} />
                <div className="absolute inset-0 bg-yellow-400/20 blur-xl" />
              </div>)}

            {/* 能量粒子 */}
            {particles.map(particle => <div key={particle.id} className="absolute animate-bounce" style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`
          }}>
                <div className="rounded-full bg-yellow-400" style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              boxShadow: `0 0 ${particle.size * 3}px #FFD700`
            }} />
              </div>)}
          </>;
      case 'romantic':
        return <>
            {/* 爱心粒子 */}
            {particles.map(particle => <div key={particle.id} className="absolute animate-pulse" style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`
          }}>
                <Heart className="text-pink-400" size={particle.size} fill={particle.color} />
              </div>)}

            {/* 浪漫装饰 */}
            <div className="absolute top-10 left-10 animate-bounce">
              <Heart className="text-pink-400/40" size={24} />
            </div>
            <div className="absolute top-20 right-20 animate-bounce delay-300">
              <Sparkles className="text-rose-400/40" size={20} />
            </div>
            <div className="absolute bottom-20 left-20 animate-bounce delay-500">
              <Star className="text-purple-400/40" size={22} />
            </div>
            <div className="absolute bottom-10 right-10 animate-bounce delay-700">
              <Moon className="text-indigo-400/40" size={26} />
            </div>
          </>;
      case 'gaming':
        return <>
            {/* 游戏粒子 */}
            {particles.map(particle => <div key={particle.id} className="absolute animate-spin" style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`
          }}>
                <div className="rounded-full" style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
            }} />
              </div>)}

            {/* 游戏装饰 */}
            <div className="absolute top-10 left-10 animate-pulse">
              <Music className="text-green-400/40" size={24} />
            </div>
            <div className="absolute top-20 right-20 animate-pulse delay-300">
              <Zap className="text-blue-400/40" size={20} />
            </div>
            <div className="absolute bottom-20 left-20 animate-pulse delay-500">
              <Star className="text-purple-400/40" size={22} />
            </div>
            <div className="absolute bottom-10 right-10 animate-pulse delay-700">
              <Sparkles className="text-cyan-400/40" size={26} />
            </div>
          </>;
      default:
        return <>
            {/* 默认粒子效果 */}
            {particles.map(particle => <div key={particle.id} className="absolute animate-pulse" style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`
          }}>
                <div className="rounded-full" style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
            }} />
              </div>)}

            {/* 默认装饰 */}
            <div className="absolute top-10 left-10 animate-bounce">
              <Star className="text-yellow-400/40" size={24} />
            </div>
            <div className="absolute top-20 right-20 animate-bounce delay-300">
              <Sparkles className="text-pink-400/40" size={20} />
            </div>
            <div className="absolute bottom-20 left-20 animate-bounce delay-500">
              <Heart className="text-red-400/40" size={22} />
            </div>
            <div className="absolute bottom-10 right-10 animate-bounce delay-700">
              <Zap className="text-blue-400/40" size={26} />
            </div>
          </>;
    }
  };
  return <div className="fixed inset-0 pointer-events-none z-10">
      {renderEffects()}
    </div>;
}

/**
 * 特效触发器组件
 * 用于在特定事件时触发特效
 */
export function EffectTrigger({
  type,
  position = 'center',
  duration = 2000
}) {
  const [isActive, setIsActive] = useState(false);
  useEffect(() => {
    setIsActive(true);
    const timer = setTimeout(() => setIsActive(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);
  if (!isActive) return null;
  const positionStyles = {
    center: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    top: 'top-10 left-1/2 transform -translate-x-1/2',
    bottom: 'bottom-10 left-1/2 transform -translate-x-1/2',
    left: 'left-10 top-1/2 transform -translate-y-1/2',
    right: 'right-10 top-1/2 transform -translate-y-1/2'
  };
  return <div className={`fixed ${positionStyles[position]} z-50 pointer-events-none`}>
      {type === 'success' && <div className="animate-bounce">
          <div className="bg-green-500/20 rounded-full p-4">
            <Sparkles className="text-green-400" size={32} />
          </div>
        </div>}
      {type === 'error' && <div className="animate-pulse">
          <div className="bg-red-500/20 rounded-full p-4">
            <Zap className="text-red-400" size={32} />
          </div>
        </div>}
      {type === 'love' && <div className="animate-ping">
          <div className="bg-pink-500/20 rounded-full p-4">
            <Heart className="text-pink-400" size={32} fill="#FFB7C5" />
          </div>
        </div>}
      {type === 'magic' && <div className="animate-spin">
          <div className="bg-purple-500/20 rounded-full p-4">
            <Star className="text-purple-400" size={32} />
          </div>
        </div>}
    </div>;
}