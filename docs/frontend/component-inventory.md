# 粤次元君 (Yue Ci Yuan Jun) - 前端组件清单与复用策略

本文档定义了“粤次元君”小程序前端的组件化拆分方案。所有开发人员在实现新页面前，**必须优先从本清单中寻找可用组件**，避免重复造轮子，保证全站 UI 风格和交互逻辑的统一。

---

## 1. 基础组件 (Base Components)

这些组件与具体业务解耦，提供基础的 UI 和交互能力。

### 1.1 顶部导航栏 (NavBar)
- **用途**: 替代原生导航栏，支持自定义左侧返回按钮、右侧扩展图标、沉浸式透明背景等。
- **输入 props**:
  - `title` (String): 导航栏标题
  - `isBack` (Boolean): 是否显示左侧返回按钮，默认 `true`
  - `transparent` (Boolean): 是否透明背景，默认 `false`
- **输出事件**: `onBack` (点击返回按钮时触发，默认执行 `wx.navigateBack`)
- **复用页面**: 几乎所有子页面（帖子详情页、需求详情页等）。
- **是否属于 MVP**: 是

### 1.2 主按钮 (PrimaryButton)
- **用途**: 全局统一的强调操作按钮（如发布、提交、报名等）。
- **输入 props**:
  - `text` (String): 按钮文案
  - `disabled` (Boolean): 是否禁用
  - `loading` (Boolean): 是否加载中状态
  - `type` (String): 颜色主题，默认品牌色
- **输出事件**: `onClick` (点击触发)
- **复用页面**: 发布作品页、发布需求页、编辑资料页、活动详情页底部。
- **是否属于 MVP**: 是

### 1.3 标签胶囊 (Tag)
- **用途**: 用于展示短文本标签，如内容分类、用户角色、状态角标。
- **输入 props**:
  - `text` (String): 标签内容
  - `type` (String): 颜色类型 (primary/success/warning/info)
  - `size` (String): 尺寸 (small/medium)
- **输出事件**: `onClick` (点击标签)
- **复用页面**: 帖子卡片（Cosplay/日常）、需求卡片（互免/有偿）、活动卡片（报名中）。
- **是否属于 MVP**: 是

### 1.4 图片上传器 (ImageUploader)
- **用途**: 统一的九宫格图片选择与预览组件。
- **输入 props**:
  - `maxCount` (Number): 最大上传数量，默认 9
  - `images` (Array): 已选择的图片路径数组
- **输出事件**: 
  - `onChange` (图片增删后触发，抛出最新数组)
- **复用页面**: 发布作品页。
- **是否属于 MVP**: 是

### 1.5 空状态卡片 (EmptyState)
- **用途**: 列表无数据、断网、被删除时的占位提示。
- **输入 props**:
  - `icon` (String): 缺省图类型 (empty/network/error)
  - `text` (String): 提示文案
  - `buttonText` (String): 操作按钮文案（可选，如“点击重试”）
- **输出事件**: `onAction` (点击操作按钮触发)
- **复用页面**: 所有列表页（首页、需求大厅、我的发布、我的需求、活动列表）。
- **是否属于 MVP**: 是

### 1.6 加载状态组件 (LoadingState)
- **用途**: 骨架屏或局部 Loading 动画，用于数据请求时的占位。
- **输入 props**:
  - `type` (String): 加载样式类型 (spinner/skeleton)
- **输出事件**: 无
- **复用页面**: 所有需要异步拉取数据的页面。
- **是否属于 MVP**: 是

---

## 2. 业务组件 (Business Components)

这些组件与特定的业务数据实体绑定，用于在不同页面中快速渲染业务卡片。

### 2.1 帖子瀑布流卡片 (PostCard)
- **用途**: 在信息流中展示“作品”或“日常”的卡片。
- **输入 props**:
  - `post` (Object): 帖子实体数据（包含 cover_image, title, user, like_count 等）
- **输出事件**: 
  - `onClick` (点击卡片，跳转详情)
  - `onLike` (点击爱心点赞)
- **复用页面**: 首页瀑布流、我的发布列表。
- **是否属于 MVP**: 是

### 2.2 需求招募卡片 (DemandCard)
- **用途**: 展示互免/有偿招募信息的列表项。
- **输入 props**:
  - `demand` (Object): 需求实体数据（包含 type, title, budget_type, location, status 等）
- **输出事件**:
  - `onClick` (点击卡片，跳转详情)
- **复用页面**: 发现/需求大厅列表、我的需求列表。
- **是否属于 MVP**: 是

### 2.3 活动资讯卡片 (EventCard)
- **用途**: 展示官方活动或漫展资讯的宽屏卡片。
- **输入 props**:
  - `event` (Object): 活动实体数据（包含 cover_image, title, start_time, status 等）
- **输出事件**:
  - `onClick` (点击卡片，跳转详情)
- **复用页面**: 活动列表页。
- **是否属于 MVP**: 是

### 2.4 评论项 (CommentItem)
- **用途**: 在详情页展示单条评论及互动操作。
- **输入 props**:
  - `comment` (Object): 评论实体数据（包含 user, content, created_at, reply_to 等）
- **输出事件**:
  - `onReply` (点击回复)
  - `onLongPress` (长按触发菜单)
- **复用页面**: 帖子详情页评论区。
- **是否属于 MVP**: 是

### 2.5 用户信息头部卡 (UserProfileHeader)
- **用途**: 个人中心或他人主页顶部的用户基本信息展示区。
- **输入 props**:
  - `user` (Object): 用户实体数据（avatar, nickname, bio, gender 等）
  - `isSelf` (Boolean): 是否为当前登录用户（控制是否显示“编辑”按钮）
- **输出事件**:
  - `onEdit` (点击编辑按钮)
  - `onFollow` (点击关注按钮，非 MVP 可选)
- **复用页面**: 我的(Profile)页面。
- **是否属于 MVP**: 是

---

## 3. 复用策略与工程规范

1. **目录结构**：
   - 基础组件存放在 `frontend/src/components/base/` 目录下。
   - 业务组件存放在 `frontend/src/components/biz/` 目录下。
2. **数据单向流动**：
   - 组件内部尽量保持“无状态(Stateless)”，不要在组件内部直接发 API 请求。
   - 业务数据通过 `props` 传入，交互行为通过 `emit`/`triggerEvent` 抛给页面(Page)处理。
3. **样式隔离**：
   - 每个组件的样式必须限定在自身作用域内（例如使用微信小程序的组件样式隔离特性），避免污染全局。
4. **渐进式增强**：
   - MVP 阶段，如果某些状态（如无数据空状态）来不及做精美插画，允许使用统一的文字替代，但**必须使用 `EmptyState` 组件包装**，以便二期统一替换。