# 粤次元君 (Yue Ci Yuan Jun) - 页面字段映射清单 (Field Mapping)

本文档旨在统一前后端对每个页面展示和提交数据的字段理解，确保页面字段与数据库实体字段一一对应，避免联调返工。

> **说明**：
> - **必填(Req)**：前端提交或后端返回时，该字段是否必须存在。
> - **可空(Null)**：该字段的值是否允许为 `null` 或空字符串。

---

## 1. 首页 (Home) - 帖子瀑布流

### 展示字段 (列表卡片)
| 页面元素 | 来源实体 | 字段名 | 类型 | Req | Null | 显示规则 |
|---|---|---|---|---|---|---|
| 帖子ID | post | `id` | Number | Y | N | 隐式字段，用于跳转详情 |
| 帖子类型 | post | `post_type` | String | Y | N | 'work' 或 'daily' |
| 封面图 | post | `cover_image` | String | Y | N | 图片 URL，按比例裁剪或等比缩放 |
| 标题 | post | `title` | String | Y | Y | 最多显示两行，超出省略号。如果为空则不显示标题栏 |
| 作者头像 | user | `avatar` | String | Y | Y | 圆形头像，为空显示默认头像 |
| 作者昵称 | user | `nickname` | String | Y | N | 单行截断 |
| 点赞数 | post | `like_count` | Number | Y | N | 超过 1w 显示 '1w+'，以此类推 |
| 评论数 | post | `comment_count` | Number | Y | N | 超过 1w 显示 '1w+'，以此类推 |

---

## 2. 发现/需求大厅 (Discovery) - 需求列表

### 展示字段 (列表卡片)
| 页面元素 | 来源实体 | 字段名 | 类型 | Req | Null | 显示规则 |
|---|---|---|---|---|---|---|
| 需求ID | demand | `id` | Number | Y | N | 隐式字段，用于跳转详情 |
| 需求类型 | demand | `demand_type` | String | Y | N | 摄影/模特/化妆/毛发/道具/后期 (标签颜色区分) |
| 标题 | demand | `title` | String | Y | N | 单行截断 |
| 城市 | demand | `city` | String | Y | Y | 为空时不显示定位图标 |
| 预算类型 | demand | `budget_type` | String | Y | N | free(互免)/paid(有偿)/negotiable(待议) |
| 活动时间 | demand | `event_time` | String | Y | Y | 格式化为 `MM-DD HH:mm`，为空显示“时间待定” |
| 状态 | demand | `status` | Number | Y | N | 1(招募中) / 2(已满员) / 0(已下架) |
| 发布者头像 | user | `avatar` | String | Y | Y | 圆形头像 |
| 发布者昵称 | user | `nickname` | String | Y | N | 单行截断 |

---

## 3. 活动 (Events) - 活动列表

### 展示字段 (列表卡片)
| 页面元素 | 来源实体 | 字段名 | 类型 | Req | Null | 显示规则 |
|---|---|---|---|---|---|---|
| 活动ID | event | `id` | Number | Y | N | 隐式字段 |
| 活动类型 | event | `event_type` | String | Y | N | news(资讯) / activity(官方活动) |
| 封面图 | event | `cover_image` | String | Y | N | 宽屏大图 16:9 |
| 标题 | event | `title` | String | Y | N | 最多两行 |
| 开始时间 | event | `start_time` | String | Y | N | 格式化为 `YYYY-MM-DD` |
| 城市 | event | `city` | String | Y | Y | 城市名称 |
| 状态 | event | `status` | Number | Y | N | 1(未开始/报名中), 2(进行中), 3(已结束) -> 对应角标 |

---

## 4. 帖子详情页 (Post Detail)

### 展示字段 (帖子内容)
| 页面元素 | 来源实体 | 字段名 | 类型 | Req | Null | 显示规则 |
|---|---|---|---|---|---|---|
| 帖子ID | post | `id` | Number | Y | N | 隐式字段 |
| 作者头像 | user | `avatar` | String | Y | Y | 顶部栏圆形头像 |
| 作者昵称 | user | `nickname` | String | Y | N | 顶部栏单行 |
| 图片列表 | post_images | `image_url` | Array | Y | N | 数组，用于轮播或大图铺开展示 |
| 标题 | post | `title` | String | Y | Y | 加粗大字号 |
| 正文 | post | `content` | String | Y | N | 支持多行换行展示 |
| 发布时间 | post | `created_at` | String | Y | N | 格式化为 `YYYY-MM-DD HH:mm` 或“XX小时前” |
| 地点 | post | `location` | String | Y | Y | 带有定位 Icon |
| 点赞数 | post | `like_count` | Number | Y | N | 底部操作栏 |
| 当前用户是否点赞| likes | `is_liked` | Boolean| Y | N | API 组装字段，控制爱心状态 |

### 展示字段 (评论列表)
| 页面元素 | 来源实体 | 字段名 | 类型 | Req | Null | 显示规则 |
|---|---|---|---|---|---|---|
| 评论ID | comment | `id` | Number | Y | N | 隐式字段 |
| 评论者头像 | user | `avatar` | String | Y | Y | 圆形小图 |
| 评论者昵称 | user | `nickname` | String | Y | N | 单行 |
| 评论内容 | comment | `content` | String | Y | N | 多行文本 |
| 回复对象 | user | `reply_user_id` | Object | N | Y | 如果存在，显示 "回复 @[被回复人昵称]" |
| 评论时间 | comment | `created_at` | String | Y | N | "XX分钟前" 格式 |

### 提交字段 (发表评论)
| 页面元素 | 目标实体 | 字段名 | 类型 | Req | Null | 说明 |
|---|---|---|---|---|---|---|
| 所属帖子 | comment | `post_id` | Number | Y | N | 路由参数 |
| 评论内容 | comment | `content` | String | Y | N | 输入框内容，限长 |
| 父级评论 | comment | `parent_id` | Number | N | Y | 回复楼中楼时带上 |
| 回复目标用户| comment | `reply_user_id` | Number | N | Y | 被回复人的 User ID |

---

## 5. 发布作品/日常页 (Create Post)

### 提交字段
| 页面元素 | 目标实体 | 字段名 | 类型 | Req | Null | 说明 |
|---|---|---|---|---|---|---|
| 帖子类型 | post | `post_type` | String | Y | N | 'work' 或 'daily' (页面入口决定) |
| 标题 | post | `title` | String | N | Y | Input，作品建议必填，日常可空 |
| 正文 | post | `content` | String | Y | N | Textarea |
| 图片列表 | post_images | `images` | Array | Y | N | 上传后的 URL 数组 (后端需拆分存入 `post_images` 表) |
| 封面图 | post | `cover_image` | String | Y | N | 默认取图片列表的第 0 项 |
| 地点 | post | `location` | String | N | Y | 微信定位 API 获取 |
| 标签 | post_tags | `tags` | Array | N | Y | 选中的 Tag ID 列表 |

---

## 6. 发布需求页 (Create Demand)

### 提交字段
| 页面元素 | 目标实体 | 字段名 | 类型 | Req | Null | 说明 |
|---|---|---|---|---|---|---|
| 需求类型 | demand | `demand_type` | String | Y | N | Picker 选择 |
| 标题 | demand | `title` | String | Y | N | Input 单行 |
| 描述 | demand | `description` | String | Y | N | Textarea 详细要求 |
| 城市 | demand | `city` | String | Y | N | Picker 城市选择 |
| 详细地点 | demand | `location` | String | N | Y | Input 选填 |
| 期望时间 | demand | `event_time` | String | N | Y | DatePicker 选择，允许待定 |
| 预算类型 | demand | `budget_type` | String | Y | N | free / paid / negotiable |
| 预算金额 | demand | `budget_amount` | Number | N | Y | 如果选 paid 则必填 |
| 需要人数 | demand | `participant_limit`| Number | Y | N | 默认 1 |

---

## 7. 需求详情页 (Demand Detail)

### 展示字段
| 页面元素 | 来源实体 | 字段名 | 类型 | Req | Null | 显示规则 |
|---|---|---|---|---|---|---|
| 详情同列表字段 | demand | `title`/`city`/`budget_type` 等同列表 | - | - | - | - |
| 详细描述 | demand | `description` | String | Y | N | 保持换行格式 |
| 具体地点 | demand | `location` | String | N | Y | 为空则不展示整行 |
| 预算金额 | demand | `budget_amount` | Number | N | Y | `budget_type` 为 paid 时展示 "¥[金额]" |
| 人数进度 | demand | `current_participants` / `participant_limit` | Number | Y | N | 显示 "已确认: [current]/[limit]" |

### 提交字段 (申请参与)
| 页面元素 | 目标实体 | 字段名 | 类型 | Req | Null | 说明 |
|---|---|---|---|---|---|---|
| 需求ID | application| `demand_id` | Number | Y | N | 路由参数 |
| 留言/附言 | application| `apply_message`| String | Y | N | Textarea 输入 |

---

## 8. 活动详情页 (Event Detail)

### 展示字段
| 页面元素 | 来源实体 | 字段名 | 类型 | Req | Null | 显示规则 |
|---|---|---|---|---|---|---|
| 标题 | event | `title` | String | Y | N | - |
| 封面 | event | `cover_image` | String | Y | N | 顶部大图 |
| 摘要 | event | `summary` | String | N | Y | 灰色小字提示 |
| 详细内容 | event | `content` | String | Y | N | 富文本(Rich-text) 或 Markdown |
| 报名截止时间 | event | `registration_deadline`| String | N | Y | 格式化时间，为空表示无限制 |
| 人数进度 | event | `current_participants` / `max_participants` | Number | Y | Y | 如果 max_participants 为空表示不限人数 |

### 提交字段 (报名活动)
| 页面元素 | 目标实体 | 字段名 | 类型 | Req | Null | 说明 |
|---|---|---|---|---|---|---|
| 活动ID | registration| `event_id` | Number | Y | N | 路由参数 |
| 表单数据 | registration| `form_data_json` | Object | Y | N | 前端组装成 JSON 字符串或对象提交 (如姓名、电话等) |

---

## 9. 我的 / 编辑资料页 (Profile)

### 展示与提交字段 (用户信息)
| 页面元素 | 目标实体 | 字段名 | 类型 | Req | Null | 说明 |
|---|---|---|---|---|---|---|
| 头像 | user | `avatar` | String | N | Y | 上传后的 URL |
| 昵称 | user | `nickname` | String | Y | N | 长度限制 1-20 |
| 性别 | user | `gender` | Number | Y | N | 0-未知, 1-男, 2-女 |
| 简介 | user | `bio` | String | N | Y | 签名档，限长 |
| 城市 | user | `city` | String | N | Y | 所在城市 |