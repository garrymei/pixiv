import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { Input } from '../../components/base/Input'
import { Textarea } from '../../components/base/Textarea'
import { Tag } from '../../components/base/Tag'
import { PrimaryButton } from '../../components/base/Button'
import { createPost, markPostListShouldRefresh } from '../../services/posts'
import { uploadImage } from '../../services/uploads'
import './index.scss'

const ALL_TAGS = ['Cosplay', '正片', '日常', '摄影', '妆娘', '后期']
const MAX_IMAGES = 3

type UploadItem = {
  id: string
  localPath: string
  remoteUrl: string
  status: 'uploading' | 'success' | 'error'
  error: string
}

export default function PublishPost() {
  const [images, setImages] = useState<UploadItem[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const uploading = images.some((item) => item.status === 'uploading')

  const uploadImages = async (items: UploadItem[]) => {
    let success = 0
    let failed = 0
    for (const item of items) {
      setImages((prev) => prev.map((image) => (image.id === item.id ? { ...image, status: 'uploading', error: '' } : image)))
      try {
        const uploaded = await uploadImage(item.localPath)
        setImages((prev) => prev.map((image) => (
          image.id === item.id
            ? { ...image, status: 'success', remoteUrl: uploaded.url, error: '' }
            : image
        )))
        success += 1
      } catch (err: any) {
        setImages((prev) => prev.map((image) => (
          image.id === item.id
            ? { ...image, status: 'error', remoteUrl: '', error: err?.message || '上传失败，请重试' }
            : image
        )))
        failed += 1
      }
    }
    return { success, failed }
  }

  const chooseImage = async () => {
    if (uploading) {
      Taro.showToast({ title: '图片上传中，请稍后再试', icon: 'none' })
      return
    }
    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) {
      Taro.showToast({ title: `最多上传${MAX_IMAGES}张图片`, icon: 'none' })
      return
    }
    try {
      const res = await Taro.chooseImage({ count: remaining })
      const selected = (res.tempFilePaths || []).map((filePath, index) => ({
        id: `${Date.now()}_${index}_${Math.random().toString(36).slice(2, 8)}`,
        localPath: filePath,
        remoteUrl: '',
        status: 'uploading' as const,
        error: ''
      }))
      if (selected.length === 0) return
      setImages((prev) => prev.concat(selected))
      const result = await uploadImages(selected)
      if (result.failed > 0) {
        Taro.showToast({ title: '部分图片上传失败', icon: 'none' })
      } else {
        Taro.showToast({ title: '图片上传完成', icon: 'success' })
      }
    } catch (err: any) {
      if (String(err?.errMsg || '').includes('cancel')) return
      Taro.showToast({ title: err?.message || '选择图片失败', icon: 'none' })
    }
  }

  const toggleTag = (t: string) => {
    setTags((prev) => (prev.includes(t) ? prev.filter((i) => i !== t) : prev.concat(t)))
  }

  const retryUpload = async (id: string) => {
    if (uploading) {
      Taro.showToast({ title: '图片上传中，请稍后再试', icon: 'none' })
      return
    }
    const item = images.find((image) => image.id === id)
    if (!item) return
    const result = await uploadImages([{ ...item, status: 'uploading', error: '' }])
    Taro.showToast({ title: result.failed > 0 ? '重试失败' : '重试成功', icon: result.failed > 0 ? 'none' : 'success' })
  }

  const removeImage = (id: string) => {
    if (uploading) {
      Taro.showToast({ title: '图片上传中，请稍后再删除', icon: 'none' })
      return
    }
    setImages((prev) => prev.filter((image) => image.id !== id))
  }

  const submit = async () => {
    const e: Record<string, string> = {}
    if (!title.trim()) e.title = '请输入标题'
    if (!content.trim()) e.content = '请输入内容'
    if (tags.length === 0) e.tags = '至少选择一个标签'
    setErrors(e)
    if (Object.keys(e).length > 0) return
    if (uploading) {
      Taro.showToast({ title: '图片上传中，请稍后发布', icon: 'none' })
      return
    }
    if (images.some((item) => item.status === 'error')) {
      Taro.showToast({ title: '有图片上传失败，请重试或删除后再发布', icon: 'none' })
      return
    }

    setSubmitting(true)
    try {
      await createPost({
        title: title.trim(),
        content: content.trim(),
        tags,
        location: location.trim(),
        images: images.map((item) => item.remoteUrl).filter(Boolean)
      })
      markPostListShouldRefresh()
      Taro.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(() => Taro.switchTab({ url: '/pages/home/index' }), 300)
    } catch (err: any) {
      Taro.showToast({ title: err?.message || '发布失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const successCount = images.filter((item) => item.status === 'success').length
  const failedCount = images.filter((item) => item.status === 'error').length

  return (
    <View className="page-publish-post page-container">
      <View className="form-section">
        <View className="upload-placeholder" onClick={chooseImage}>
          {images.length === 0 ? <Text>点击选择图片，最多上传{MAX_IMAGES}张</Text> : <Text>继续添加图片</Text>}
        </View>
        <Text style={{ display: 'block', marginTop: '12rpx', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          {uploading ? '图片上传中...' : `已上传 ${successCount}/${images.length}`}
          {failedCount > 0 ? `，失败 ${failedCount} 张` : ''}
        </Text>
        {images.length > 0 ? (
          <View style={{ display: 'flex', flexWrap: 'wrap', gap: '16rpx', marginTop: '16rpx' }}>
            {images.map((item, idx) => (
              <View key={item.id} style={{ width: '200rpx' }}>
                <View style={{ position: 'relative', width: '200rpx', height: '200rpx', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--color-bg-card)' }}>
                  <Image src={item.localPath} mode="aspectFill" style={{ width: '100%', height: '100%' }} />
                  <View style={{ position: 'absolute', left: '12rpx', top: '12rpx', padding: '4rpx 12rpx', borderRadius: '999rpx', backgroundColor: 'rgba(0, 0, 0, 0.55)' }}>
                    <Text style={{ color: '#fff', fontSize: '20rpx' }}>#{idx + 1}</Text>
                  </View>
                  <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10rpx 12rpx', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <Text style={{ color: '#fff', fontSize: '22rpx' }}>
                      {item.status === 'uploading' ? '上传中' : item.status === 'success' ? '上传成功' : '上传失败'}
                    </Text>
                  </View>
                </View>
                {item.status === 'error' ? (
                  <Text style={{ display: 'block', marginTop: '8rpx', color: 'var(--color-error)', fontSize: 'var(--font-size-xs)' }}>
                    {item.error || '上传失败，请重试'}
                  </Text>
                ) : item.status === 'success' ? (
                  <Text style={{ display: 'block', marginTop: '8rpx', color: 'var(--color-success)', fontSize: 'var(--font-size-xs)' }}>
                    已获得可发布图片地址
                  </Text>
                ) : (
                  <Text style={{ display: 'block', marginTop: '8rpx', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                    正在上传到服务器
                  </Text>
                )}
                <View style={{ display: 'flex', gap: '16rpx', marginTop: '8rpx' }}>
                  {item.status === 'error' ? (
                    <Text style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)' }} onClick={() => retryUpload(item.id)}>
                      重试
                    </Text>
                  ) : null}
                  <Text style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }} onClick={() => removeImage(item.id)}>
                    删除
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}
        <Input label="标题" value={title} onInput={(e) => setTitle((e.detail as any).value)} error={errors.title} placeholder="填写你的作品标题" />
      </View>
      <View className="form-section">
        <Textarea label="内容" value={content} onInput={(e) => setContent((e.detail as any).value)} error={errors.content} showCount maxlength={300} placeholder="简单介绍你的作品或日常" />
      </View>
      <View className="form-section">
        <Text>标签</Text>
        <View className="tag-row">
          {ALL_TAGS.map((t) => (
            <View key={t} onClick={() => toggleTag(t)}>
              <Tag type={tags.includes(t) ? 'primary' : 'default'} outline={!tags.includes(t)} size="medium">{t}</Tag>
            </View>
          ))}
        </View>
        {errors.tags && <Text style={{ color: 'var(--color-error)' }}>{errors.tags}</Text>}
      </View>
      <View className="form-section">
        <Input label="定位" value={location} onInput={(e) => setLocation((e.detail as any).value)} placeholder="可选，输入拍摄地或所在城市" />
      </View>
      <PrimaryButton block loading={submitting || uploading} onClick={submit}>发布</PrimaryButton>
    </View>
  )
}
