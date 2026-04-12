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
  const canSubmit = Boolean(title.trim() && content.trim() && tags.length > 0 && !uploading && !submitting)

  return (
    <View className="page-publish-post page-container-full">
      <View className="page-publish-post__hero">
        <View className="page-publish-post__hero-copy">
          <Text className="page-publish-post__eyebrow">POSTS</Text>
          <Text className="page-publish-post__title">发布动态</Text>
          <Text className="page-publish-post__subtitle">发一条有氛围感的作品或日常，让你的状态被同频的人看到。</Text>
        </View>
        <View className="page-publish-post__hero-badge" onClick={submit}>
          <Text className="page-publish-post__hero-badge-text">实时发布</Text>
        </View>
      </View>

      <View className="page-publish-post__card form-section">
        <View className="page-publish-post__section-head">
          <View>
            <Text className="page-publish-post__section-title">上传图片</Text>
            <Text className="page-publish-post__section-desc">优先放最抓眼的封面图，作品打开后的第一印象会更好。</Text>
          </View>
          <Text className="page-publish-post__section-extra">{successCount}/{images.length || 0}</Text>
        </View>

        <View className="page-publish-post__upload-grid">
          <View className="page-publish-post__upload-tile" onClick={chooseImage}>
            <View className="page-publish-post__upload-icon">+</View>
            <Text className="page-publish-post__upload-title">{images.length === 0 ? '添加图片' : '继续添加'}</Text>
            <Text className="page-publish-post__upload-hint">最多上传 {MAX_IMAGES} 张</Text>
          </View>

          {images.map((item, idx) => (
            <View key={item.id} className="page-publish-post__media-item">
              <View className="page-publish-post__media-frame">
                <Image src={item.localPath} mode="aspectFill" className="page-publish-post__media-image" />
                <View className="page-publish-post__media-index">
                  <Text>#{idx + 1}</Text>
                </View>
                <View className={`page-publish-post__media-status page-publish-post__media-status--${item.status}`}>
                  <Text>{item.status === 'uploading' ? '上传中' : item.status === 'success' ? '已完成' : '失败'}</Text>
                </View>
              </View>

              <Text className={`page-publish-post__media-desc page-publish-post__media-desc--${item.status}`}>
                {item.status === 'error'
                  ? (item.error || '上传失败，请重试')
                  : item.status === 'success'
                    ? '图片已准备好发布'
                    : '正在上传到服务器'}
              </Text>

              <View className="page-publish-post__media-actions">
                {item.status === 'error' ? (
                  <Text className="page-publish-post__media-action page-publish-post__media-action--primary" onClick={() => retryUpload(item.id)}>
                    重试
                  </Text>
                ) : null}
                <Text className="page-publish-post__media-action" onClick={() => removeImage(item.id)}>
                  删除
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text className="page-publish-post__upload-summary">
          {uploading ? '图片上传中，请稍候再发布。' : `已成功上传 ${successCount} 张图片`}
          {failedCount > 0 ? `，失败 ${failedCount} 张` : ''}
        </Text>
      </View>

      <View className="page-publish-post__card form-section">
        <View className="page-publish-post__section-head">
          <View>
            <Text className="page-publish-post__section-title">内容信息</Text>
            <Text className="page-publish-post__section-desc">标题负责吸引点击，正文负责让同好停下来认真看。</Text>
          </View>
        </View>

        <Input
          label="标题"
          value={title}
          onInput={(e) => setTitle((e.detail as any).value)}
          error={errors.title}
          placeholder="例如：周末外拍返图，今天状态超好"
        />
        <Textarea
          label="内容"
          value={content}
          onInput={(e) => setContent((e.detail as any).value)}
          error={errors.content}
          showCount
          maxlength={300}
          placeholder="写下今天的作品亮点、拍摄心情、角色设定，或者想和谁一起约下一场。"
        />
        <Input
          label="定位"
          value={location}
          onInput={(e) => setLocation((e.detail as any).value)}
          placeholder="可选，输入拍摄地、漫展名或所在城市"
        />
      </View>

      <View className="page-publish-post__card form-section">
        <View className="page-publish-post__section-head">
          <View>
            <Text className="page-publish-post__section-title">选择标签</Text>
            <Text className="page-publish-post__section-desc">让内容更容易被同城、同角色、同爱好的用户看到。</Text>
          </View>
          <Text className="page-publish-post__section-extra">{tags.length} 个</Text>
        </View>

        <View className="tag-row">
          {ALL_TAGS.map((t) => (
            <View key={t} className="page-publish-post__tag-item" onClick={() => toggleTag(t)}>
              <Tag type={tags.includes(t) ? 'primary' : 'default'} outline={!tags.includes(t)} size="medium">
                {t}
              </Tag>
            </View>
          ))}
        </View>
        {errors.tags && <Text className="page-publish-post__tag-error">{errors.tags}</Text>}
      </View>

      <View className="page-publish-post__bottom-bar">
        <View className="page-publish-post__bottom-copy">
          <Text className="page-publish-post__bottom-title">准备好了就发布</Text>
          <Text className="page-publish-post__bottom-desc">内容会进入首页推荐流和你的个人主页展示。</Text>
        </View>
        <PrimaryButton
          block
          loading={submitting || uploading}
          disabled={!canSubmit}
          className="page-publish-post__submit"
          onClick={submit}
        >
          发布动态
        </PrimaryButton>
      </View>
    </View>
  )
}
