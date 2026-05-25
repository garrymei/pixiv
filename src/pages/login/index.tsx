import { View, Text, Image, Input as TaroInput, Button as TaroButton } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'

import { PrimaryButton, SecondaryButton } from '../../components/base/Button'
import defaultLoginPoster from '../../assets/login/login-poster.jpg'
import { listBanners } from '../../services/banners'
import { enterGuestMode, loginWithWechatProfile } from '../../services/request'
import { updateCurrentUser } from '../../services/user'
import { uploadImage } from '../../services/uploads'
import { useThemeMode } from '../../config/theme'

import './index.scss'

export default function Login() {
  const [nickname, setNickname] = useState('')
  const [avatarPath, setAvatarPath] = useState('')
  const [posterUrl, setPosterUrl] = useState('')
  const [showWechatModal, setShowWechatModal] = useState(false)
  const [wechatStep, setWechatStep] = useState<'avatar' | 'nickname'>('avatar')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const nicknameFallbackAtRef = useRef(0)
  const { theme } = useThemeMode()

  useEffect(() => {
    listBanners('login_poster')
      .then((list) => {
        setPosterUrl(list[0]?.imageUrl || '')
      })
      .catch(() => {
        setPosterUrl('')
      })
  }, [])

  const handleOpenWechatModal = () => {
    setError('')
    setWechatStep(avatarPath ? 'nickname' : 'avatar')
    setShowWechatModal(true)
  }

  const handleCloseWechatModal = () => {
    if (loading) return
    setError('')
    setShowWechatModal(false)
  }

  const handleChooseWechatAvatar = (e: any) => {
    const nextAvatar = e?.detail?.avatarUrl || ''
    if (!nextAvatar) {
      setError('未获取到微信头像，请重试')
      return
    }
    setError('')
    setAvatarPath(nextAvatar)
    setWechatStep('nickname')
  }

  const applyWechatNickName = (nickName: string) => {
    const next = (nickName || '').trim()
    if (!next) {
      setError('未获取到微信昵称，请重试')
      return
    }
    if (next === '微信用户') {
      setNickname(next)
      Taro.showToast({ title: '微信昵称受限制，请手动修改', icon: 'none' })
      return
    }
    setNickname(next)
  }

  const handleGetWechatNicknameFromButton = async (e: any) => {
    setError('')
    const nickName = e?.detail?.userInfo?.nickName || ''
    if (nickName) {
      applyWechatNickName(nickName)
      return
    }

    const now = Date.now()
    if (now - nicknameFallbackAtRef.current < 1800) {
      setError('获取微信昵称过于频繁，请稍后再试')
      return
    }
    nicknameFallbackAtRef.current = now

    try {
      const profile = await Taro.getUserProfile({ desc: '用于读取微信昵称并完成登录' })
      const userInfo = profile.userInfo as any
      applyWechatNickName(userInfo?.nickName || '')
    } catch (err: any) {
      if (err?.errMsg?.includes('cancel')) return
      if (err?.errMsg?.includes('too frequently')) {
        setError('获取微信昵称过于频繁，请稍后再试')
        return
      }
      setError('未获取到微信昵称，请重试')
    }
  }

  const handleLogin = async () => {
    setError('')
    if (!avatarPath) {
      setError('请先获取微信头像')
      return
    }
    if (!nickname.trim()) {
      setError('请先获取微信昵称')
      return
    }
    setLoading(true)
    try {
      const trimmedNickname = nickname.trim()
      await loginWithWechatProfile(trimmedNickname)
      if (avatarPath) {
        const uploaded = await uploadImage(avatarPath)
        await updateCurrentUser({ nickname: trimmedNickname, avatar: uploaded.url })
      }
      Taro.showToast({ title: '次元连接成功', icon: 'success' })
      setShowWechatModal(false)
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/home/index' })
      }, 600)
    } catch (err: any) {
      setError(err?.message || '连接失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    enterGuestMode()
    Taro.switchTab({ url: '/pages/home/index' })
  }

  return (
    <View className={classNames('page-login', `theme-${theme}`)}>
      <View className="page-login__hero">
        <View className="page-login__status">
          <View className="page-login__status-dot anim-pulse-secondary" />
          <Text className="page-login__status-text">System Online / 湾区枢纽</Text>
        </View>
        <Text className="page-login__title anim-text-glow">粤次元君</Text>
        <Text className="page-login__subtitle">游客模式仅浏览内容；正式登录后才可点赞、评论、发布和报名。</Text>
        <View className="page-login__poster">
          <Image className="page-login__poster-image" src={posterUrl || defaultLoginPoster} mode="aspectFill" />
        </View>
      </View>

      <View className="page-login__panel">
        <View className="page-login__section">
          <Text className="page-login__section-title">WECHAT LOGIN // 正式登录</Text>
          <Text className="page-login__login-desc">点击微信登录后弹出授权小窗，读取微信头像与微信昵称，再完成登录。</Text>
        </View>

        {error && <Text className="page-login__error">{error}</Text>}

        <View className="page-login__actions">
          <PrimaryButton className="page-login__action-button" block loading={loading} onClick={handleOpenWechatModal}>
            微信登录
          </PrimaryButton>

          <View className="page-login__skip" onClick={handleSkip}>
            <Text>以游客身份浏览 {'>'}</Text>
          </View>
        </View>
      </View>

      {showWechatModal ? (
        <View className="page-login__modal-mask" onClick={handleCloseWechatModal}>
          <View className="page-login__modal" onClick={(e) => e.stopPropagation()}>
            <Text className="page-login__modal-title">微信登录</Text>
            <Text className="page-login__modal-desc">请先获取微信头像，再获取微信昵称；头像和昵称齐全后才可确认登录。</Text>

            <View className="page-login__wechat-card">
              <View className="page-login__wechat-avatar">
                {avatarPath ? <Image className="page-login__wechat-avatar-image" src={avatarPath} mode="aspectFill" /> : <Text className="page-login__wechat-avatar-placeholder">WX</Text>}
              </View>
              <View className="page-login__wechat-main">
                <Text className="page-login__wechat-label">微信头像与昵称</Text>
                <TaroInput
                  className="page-login__wechat-input"
                  value={nickname}
                  onInput={(e) => setNickname((e.detail as any).value)}
                  placeholder="获取微信昵称后会自动填充，也可手动修改"
                  placeholderTextColor="rgba(255,255,255,0.38)"
                />
              </View>
            </View>

            <View className="page-login__wechat-action">
              {wechatStep === 'avatar' ? (
                <TaroButton
                  openType="chooseAvatar"
                  className="page-login__wechat-avatar-btn"
                  onChooseAvatar={handleChooseWechatAvatar}
                >
                  获取微信头像
                </TaroButton>
              ) : (
                <TaroButton
                  openType="getUserInfo"
                  className="page-login__wechat-nickname-btn"
                  onGetUserInfo={handleGetWechatNicknameFromButton}
                >
                  {nickname.trim() ? '重新获取微信昵称' : '获取微信昵称'}
                </TaroButton>
              )}
              <Text className="page-login__wechat-tip">
                {wechatStep === 'avatar' ? '第一步：先获取微信头像' : '第二步：再获取微信昵称'}
              </Text>
            </View>

            {error ? <Text className="page-login__error page-login__error--modal">{error}</Text> : null}

            <View className="page-login__modal-actions">
              <PrimaryButton className="page-login__modal-btn" loading={loading} onClick={handleLogin}>确认微信登录</PrimaryButton>
              <SecondaryButton className="page-login__modal-btn" onClick={handleCloseWechatModal}>取消</SecondaryButton>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  )
}
