# 粤次元君 (Yue Ci Yuan Jun) - 前端 Design Tokens

本文档定义了“粤次元君”小程序前端的视觉样式变量（Design Tokens）。
基于**“二次元精致感、紫蓝霓虹、深色背景、粉色点缀”**的设计语言，我们在前端代码中必须使用以下变量，**严禁在页面中硬编码十六进制颜色值或随意指定间距圆角**。

---

## 1. 颜色 Tokens (Color)

### 1.1 主题色与强调色
| Token 变量名 | 颜色值 (Hex/RGB) | 用途说明 |
|---|---|---|
| `--color-primary` | `#7C4DFF` | 品牌主色调（紫蓝色），用于主按钮、核心高亮、TabBar 选中 |
| `--color-secondary` | `#FF4081` | 辅助强调色（霓虹粉），用于点赞爱心、重要消息提示、特殊徽章 |
| `--color-tertiary` | `#00E5FF` | 赛博青色，用于科技感点缀、部分边框发光效果 |

### 1.2 背景色 (深色主题)
| Token 变量名 | 颜色值 (Hex/RGB) | 用途说明 |
|---|---|---|
| `--color-bg-page` | `#121212` | 页面最底层背景色，极深灰（非纯黑，避免太刺眼） |
| `--color-bg-card` | `#1E1E1E` | 卡片背景色，如帖子列表的卡片、弹窗背景 |
| `--color-bg-card-hover`| `#2A2A2A` | 卡片点击/按压时的反馈背景色 |
| `--color-bg-overlay` | `rgba(0,0,0,0.6)`| 遮罩层背景色（弹窗、全屏 Loading 底部遮罩） |

### 1.3 文字颜色
| Token 变量名 | 颜色值 (Hex/RGB) | 用途说明 |
|---|---|---|
| `--color-text-primary` | `#FFFFFF` | 主要文字，如标题、正文、主按钮文字 |
| `--color-text-regular` | `#E0E0E0` | 常规文字，如次要正文、段落 |
| `--color-text-secondary`| `#9E9E9E` | 辅助文字，如时间戳、地点信息、未激活的 Tab |
| `--color-text-placeholder`| `#757575` | 输入框占位符、禁用的文字 |

### 1.4 功能状态色
| Token 变量名 | 颜色值 (Hex/RGB) | 用途说明 |
|---|---|---|
| `--color-success` | `#00C853` | 成功状态（如：报名成功、发布成功） |
| `--color-warning` | `#FFD600` | 警告状态（如：余额不足、时间临近） |
| `--color-error` | `#D50000` | 错误状态（如：表单校验失败、网络断开） |

---

## 2. 字体与排版 Tokens (Typography)

> 微信小程序默认使用系统字体，我们主要规范字号和字重。建议使用 `rpx` 以适配不同屏幕。

| Token 变量名 | 值 (rpx/px) | 用途说明 |
|---|---|---|
| `--font-size-xxl` | `48rpx` (24px) | 超大标题（如活动详情页大标题） |
| `--font-size-xl` | `40rpx` (20px) | 页面大标题、导航栏标题 |
| `--font-size-lg` | `36rpx` (18px) | 模块标题、卡片标题 |
| `--font-size-md` | `32rpx` (16px) | **基础正文字号**，列表文字、按钮文字 |
| `--font-size-sm` | `28rpx` (14px) | 辅助信息、二级文案、评论正文 |
| `--font-size-xs` | `24rpx` (12px) | 最小字号，用于时间戳、Tag 标签、点赞数统计 |

| Token 变量名 | 字重 (Weight) | 用途说明 |
|---|---|---|
| `--font-weight-bold` | `600` / `bold` | 强调标题、强调数据 |
| `--font-weight-regular`| `400` / `normal`| 正常内容文字 |

---

## 3. 间距 Tokens (Spacing)

> 统一的间距节奏（基于 4 或 8 的倍数）。

| Token 变量名 | 值 (rpx) | 用途说明 |
|---|---|---|
| `--space-xs` | `8rpx` | 元素间极小间距（如 Icon 与相邻文字） |
| `--space-sm` | `16rpx` | 紧凑间距（如卡片内标题与正文的距离） |
| `--space-md` | `24rpx` | **基础间距**，如普通列表项的间距 |
| `--space-lg` | `32rpx` | 宽松间距，如页面的左右内边距 (Padding)、卡片间距 |
| `--space-xl` | `48rpx` | 大区块之间的分隔间距 |

---

## 4. 圆角 Tokens (Border Radius)

> 结合“二次元”的柔和与精致，避免死板的直角。

| Token 变量名 | 值 (rpx) | 用途说明 |
|---|---|---|
| `--radius-sm` | `8rpx` | 小元素圆角（如 Tag 标签、小图片） |
| `--radius-md` | `16rpx` | 中等圆角（如输入框、按钮） |
| `--radius-lg` | `24rpx` | **大圆角**（如瀑布流卡片、底部弹窗的上圆角） |
| `--radius-round`| `9999rpx` | 全圆角（如胶囊按钮、圆形头像） |

---

## 5. 阴影与发光 Tokens (Shadow & Glow)

> 在深色背景下，传统灰色阴影不明显，我们使用“霓虹发光”或深色弥散阴影来体现层级。

| Token 变量名 | 值 (box-shadow) | 用途说明 |
|---|---|---|
| `--shadow-card` | `0 4rpx 16rpx rgba(0, 0, 0, 0.4)` | 基础卡片阴影，使其浮于页面背景之上 |
| `--shadow-glow-primary`| `0 0 16rpx rgba(124, 77, 255, 0.4)`| 主题色霓虹发光（用于高亮按钮或选中状态边框） |
| `--shadow-glow-pink` | `0 0 16rpx rgba(255, 64, 129, 0.5)`| 粉色发光（用于特别强调，如大促 Banner 或核心入口） |

---

## 6. 层级 Tokens (Z-Index)

> 规范层级顺序，防止弹窗被导航栏遮挡等经典 Bug。

| Token 变量名 | 值 | 用途说明 |
|---|---|---|
| `--z-index-base` | `1` | 基础卡片、列表内容 |
| `--z-index-sticky` | `100` | 吸顶元素（如 Tab 切换栏） |
| `--z-index-navbar` | `500` | 顶部自定义导航栏 |
| `--z-index-tabbar` | `600` | 底部 TabBar |
| `--z-index-overlay` | `900` | 遮罩层 (Mask) |
| `--z-index-modal` | `1000` | 弹窗内容、BottomSheet |
| `--z-index-toast` | `2000` | 全局 Toast 提示、Loading |

---

## 7. 在工程中的使用方式建议

在微信小程序（如使用 Less/Sass，或者原生 WXSS 中配置 `page`）：

```css
page {
  /* Colors */
  --color-primary: #7C4DFF;
  --color-secondary: #FF4081;
  --color-bg-page: #121212;
  --color-bg-card: #1E1E1E;
  
  /* ...其他变量... */
}

/* 页面中使用 */
.my-card {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  box-shadow: var(--shadow-card);
}
.my-title {
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}
```