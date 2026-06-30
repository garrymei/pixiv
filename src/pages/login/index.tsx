import { View, Text, Image, Input as TaroInput, Button as TaroButton } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import classNames from 'classnames'

import { PrimaryButton, SecondaryButton } from '../../components/base/Button'
import defaultLoginPoster from '../../assets/login/login-poster.jpg'
import { listBanners } from '../../services/banners'
import { bootstrapSession, enterGuestMode, getSessionUser, hasAuthenticatedSession, loginWithWechatProfile } from '../../services/request'
import { updateCurrentUser } from '../../services/user'
import { uploadImage } from '../../services/uploads'
import { useThemeMode } from '../../config/theme'

import './index.scss'

export default function Login() {
  const [nickname, setNickname] = useState('')
  const [avatarPath, setAvatarPath] = useState('')
  const [posterUrl, setPosterUrl] = useState('')
  const [showWechatModal, setShowWechatModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { theme } = useThemeMode()

  useEffect(() => {
    if (hasAuthenticatedSession()) {
      bootstrapSession()
        .then(() => {
          Taro.switchTab({ url: '/pages/home/index' })
        })
        .catch(() => undefined)
    }

    listBanners('login_poster')
      .then((list) => {
        setPosterUrl(list[0]?.imageUrl || '')
      })
      .catch(() => {
        setPosterUrl('')
      })
  }, [])

  const enterHome = () => {
    setShowWechatModal(false)
    setTimeout(() => {
      Taro.switchTab({ url: '/pages/home/index' })
    }, 300)
  }

  const handleOpenWechatModal = async () => {
    if (hasAuthenticatedSession()) {
      Taro.switchTab({ url: '/pages/home/index' })
      return
    }
    setError('')
    setLoading(true)
    try {
      const result = await loginWithWechatProfile('')
      const user = result.user || getSessionUser()
      if (user?.nickname) setNickname(user.nickname)
      if (user?.profile_complete) {
        Taro.showToast({ title: '登录成功', icon: 'success' })
        enterHome()
        return
      }
      setShowWechatModal(true)
    } catch (err: any) {
      setError(err?.message || '连接失败，请稍后重试')
    } finally {
      setLoading(false)
    }
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
  }

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const trimmedNickname = nickname.trim()
      if (!hasAuthenticatedSession()) {
        await loginWithWechatProfile(trimmedNickname)
      }
      if (avatarPath) {
        const uploaded = await uploadImage(avatarPath)
        await updateCurrentUser({ nickname: trimmedNickname || getSessionUser()?.nickname || '微信用户', avatar: uploaded.url })
      } else if (trimmedNickname) {
        await updateCurrentUser({ nickname: trimmedNickname })
      }
      Taro.showToast({ title: '次元连接成功', icon: 'success' })
      enterHome()
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

  const handleCompleteLater = () => {
    if (!hasAuthenticatedSession()) {
      handleCloseWechatModal()
      return
    }
    Taro.showToast({ title: '登录成功', icon: 'success' })
    enterHome()
  }

  return (
    <View className={classNames('page-login', `theme-${theme}`)}>
      <View className="page-login__hero">
        <View className="page-login__status">
          <View className="page-login__status-dot anim-pulse-secondary" />
          <Text className="page-login__status-text">System Online / 次元区在线</Text>
        </View>
        <Text className="page-login__title anim-text-glow">就酱次元区</Text>
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
            <Text className="page-login__modal-desc">首次登录建议填写昵称和头像；之后会自动保持登录，无需每次重新授权。</Text>

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
                  type="nickname"
                  placeholder="填写昵称"
                  placeholderTextColor="rgba(255,255,255,0.38)"
                />
              </View>
            </View>

            <View className="page-login__wechat-action">
              <TaroButton
                openType="chooseAvatar"
                className="page-login__wechat-avatar-btn"
                onChooseAvatar={handleChooseWechatAvatar}
              >
                {avatarPath ? '重新选择头像' : '选择头像'}
              </TaroButton>
              <Text className="page-login__wechat-tip">
                昵称可手动填写；头像可选，之后也能在编辑资料里修改
              </Text>
            </View>

            {error ? <Text className="page-login__error page-login__error--modal">{error}</Text> : null}

            <View className="page-login__modal-actions">
              <PrimaryButton className="page-login__modal-btn" loading={loading} onClick={handleLogin}>确认微信登录</PrimaryButton>
              <SecondaryButton className="page-login__modal-btn" onClick={handleCompleteLater}>稍后完善</SecondaryButton>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  )
}
