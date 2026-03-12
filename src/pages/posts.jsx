// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { ImagePlus, Send, X } from 'lucide-react';

import { BottomNav } from '@/components/BottomNav';
export default function Posts({
  $w
}) {
  const {
    toast
  } = useToast();
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const currentUser = $w.auth.currentUser || {};
  const tags = ['日常', '动漫', '游戏', '美食', '旅行', '音乐', '摄影', '手工', 'cosplay', '同人'];
  const handleTagToggle = tag => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      toast({
        variant: 'destructive',
        title: '标签太多',
        description: '最多选择5个标签'
      });
    }
  };
  const handleImageUpload = () => {
    // 模拟图片上传
    const mockImages = ['https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=600&fit=crop'];
    setSelectedImage(mockImages[Math.floor(Math.random() * mockImages.length)]);
  };
  const handlePublish = async () => {
    if (!content.trim()) {
      toast({
        variant: 'destructive',
        title: '内容不能为空',
        description: '请输入你要分享的内容'
      });
      return;
    }
    setLoading(true);
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      await db.collection('daily_posts').add({
        content,
        image: selectedImage,
        tags: selectedTags,
        name: currentUser.name || '匿名用户',
        avatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
        userId: currentUser.userId || 'anonymous',
        location: '未知地点',
        likeCount: 0,
        commentCount: 0,
        isLiked: false,
        createdAt: new Date().getTime()
      });
      toast({
        title: '发布成功',
        description: '你的动态已发布'
      });

      // 清空表单
      setContent('');
      setSelectedTags([]);
      setSelectedImage(null);

      // 返回首页
      $w.utils.navigateTo({
        pageId: 'home'
      });
    } catch (error) {
      console.error('发布失败:', error);
      toast({
        variant: 'destructive',
        title: '发布失败',
        description: error.message || '无法发布动态'
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-[#FFB7C5]/10 via-[#87CEEB]/10 to-[#98FB98]/10 pb-24">
      {/* 头部 */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#FFB7C5]/20">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{
          fontFamily: 'Fredoka One, cursive',
          color: '#FF6B6B'
        }}>
            发布动态
          </h1>
          <Button onClick={handlePublish} disabled={loading || !content.trim()} className="bg-gradient-to-r from-[#FFB7C5] to-[#FF6B6B] text-white rounded-full px-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <Send size={16} className="mr-2" />
            {loading ? '发布中...' : '发布'}
          </Button>
        </div>
      </header>
      
      {/* 主要内容 */}
      <main className="max-w-md mx-auto px-4 py-6">
        {/* 图片上传 */}
        <div className="mb-4">
          {selectedImage ? <div className="relative rounded-2xl overflow-hidden">
              <img src={selectedImage} alt="预览" className="w-full h-64 object-cover" />
              <button onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                <X size={16} />
              </button>
            </div> : <button onClick={handleImageUpload} className="w-full h-32 border-2 border-dashed border-[#FFB7C5]/50 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:border-[#FF6B6B] hover:bg-[#FFB7C5]/5 transition-all duration-300">
              <ImagePlus size={32} className="mb-2 text-[#FFB7C5]" />
              <span className="text-sm">添加图片</span>
            </button>}
        </div>
        
        {/* 文字输入 */}
        <div className="mb-4">
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="分享你的日常吧... ✨" className="w-full min-h-[120px] p-4 bg-white rounded-2xl border-2 border-[#FFB7C5]/30 focus:border-[#FF6B6B] focus:outline-none resize-none text-gray-700 transition-all duration-300" style={{
          fontFamily: 'Nunito, sans-serif'
        }} maxLength={500} />
          <div className="text-right text-xs text-gray-400 mt-1">
            {content.length}/500
          </div>
        </div>
        
        {/* 标签选择 */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3" style={{
          fontFamily: 'Fredoka One, cursive'
        }}>
            选择标签
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => {
            const isSelected = selectedTags.includes(tag);
            return <button key={tag} onClick={() => handleTagToggle(tag)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isSelected ? 'bg-gradient-to-r from-[#FFB7C5] to-[#FF6B6B] text-white shadow-md scale-105' : 'bg-white text-gray-600 hover:bg-[#FFB7C5]/10 border border-[#FFB7C5]/30'}`} style={{
              fontFamily: 'Nunito, sans-serif'
            }}>
                  {tag}
                </button>;
          })}
          </div>
        </div>
      </main>
      
      <BottomNav $w={$w} currentPage="posts" />
    </div>;
}