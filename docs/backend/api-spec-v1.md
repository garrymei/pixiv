# 粤次元君 (Yue Ci Yuan Jun) - API 详细定义规格 (API Spec V1)

本文档为“粤次元君”MVP 阶段的后端 API 详细规格说明，可直接用于后端实现与前端联调。

## 阶段 4 联调字段对齐结论

| 问题项 | 现象 | 对齐结果 |
| --- | --- | --- |
| 帖子作者字段 | 前端历史兼容 `authorId/author_name`，后端已补齐 `user` 对象 | 帖子列表、详情、我的发布统一返回 `author_id + user` |
| 帖子统计字段 | 列表与详情点赞/评论数可能不一致 | 帖子列表、详情、发布返回统一包含 `like_count`、`comment_count` |
| 图片字段结构 | `images` 可能为空、`cover_image` 可能缺失 | 后端统一返回 `images: []`、`cover_image: ""`，前端不再依赖字符串兼容 |
| 评论作者信息 | 评论列表仅有 `user_id`，前端需兜底拼昵称 | 评论列表统一返回 `user` 对象，结构与帖子作者一致 |
| 评论列表结构 | 原实现直接返回数组 | 评论列表统一返回 `{ total, list }` |
| 需求作者字段 | 前端历史兼容 `authorId`，后端缺少作者详情 | 需求列表、详情、我的需求、我的参与统一返回 `author_id + user` |
| null/空值处理 | 时间、预算、人数等字段可能缺失 | 后端统一使用 `null` 表示无值，前端统一兜底为空文本 |
| 时间字段格式 | 前端同时兼容时间戳和 ISO 字符串 | 当前约定统一为毫秒时间戳；前端保留兼容解析，避免旧数据报错 |
| 活动字段结构 | 列表/详情存在可选字段缺失 | 活动列表、详情统一返回完整键，空值使用 `null` 或空字符串 |
| 我的数据入口 | 文档与实际路由不一致 | 文档已同步更新为当前实现路由 |

## 全局规范
1. **Base URL**: `/api/v1`
2. **鉴权方式**: Header 中携带 `Authorization: Bearer <token>`
3. **统一返回结构**:
```json
{
  "code": 0,          // 0: 成功，非0: 失败
  "msg": "success",   // 错误提示信息
  "data": {}          // 业务数据，可为 Object 或 Array
}
```

---

## 1. 用户模块 (User)

### 1.1 微信登录
- **URL**: `/users/login/wechat`
- **Method**: `POST`
- **鉴权**: 否
- **Body 参数**:
  - `code` (String, 必填): 微信 `wx.login` 获取的临时登录凭证
- **返回数据**:
  ```json
  {
    "token": "jwt_token_string",
    "user": {
      "id": 1,
      "nickname": "微信用户",
      "avatar": "url",
      "is_new": true
    }
  }
  ```

### 1.2 获取当前用户信息
- **URL**: `/users/me`
- **Method**: `GET`
- **鉴权**: 是
- **返回数据**:
  ```json
  {
    "id": 1,
    "nickname": "粤次元君",
    "avatar": "",
    "bio": "二次元同好聚集地",
    "city": "广州",
    "role_type": "user"
  }
  ```

### 1.3 更新个人资料
- **URL**: `/users/me`
- **Method**: `PATCH`
- **鉴权**: 是
- **Body 参数**:
  - `nickname` (String, 可选): 昵称 (1-20字符)
  - `avatar` (String, 可选): 头像URL
  - `gender` (Number, 可选): 0-未知, 1-男, 2-女
  - `bio` (String, 可选): 个人简介
  - `city` (String, 可选): 城市
- **返回数据**: 更新后的 User 对象。

---

## 2. 帖子模块 (Post)

### 2.1 获取帖子列表 (首页瀑布流)
- **URL**: `/posts`
- **Method**: `GET`
- **鉴权**: 否 (带 Token 时会额外返回 `is_liked` 状态)
- **Query 参数**:
  - `page` (Number, 必填): 页码，默认 1
  - `size` (Number, 必填): 每页数量，默认 10
  - `post_type` (String, 可选): `work` 或 `daily`
- **返回数据**:
  ```json
  {
    "total": 100,
    "list": [
      {
        "id": 1,
        "author_id": 10,
        "post_type": "work",
        "title": "今日漫展返图",
        "cover_image": "url",
        "images": ["url1", "url2"],
        "tags": ["cos", "广州"],
        "location": "广州",
        "created_at": 1774888000000,
        "like_count": 120,
        "comment_count": 15,
        "user": { "id": 10, "nickname": "摄影老法师", "avatar": "url" }
      }
    ]
  }
  ```

### 2.2 获取帖子详情
- **URL**: `/posts/:id`
- **Method**: `GET`
- **鉴权**: 否
- **返回数据**: 与列表单项字段保持一致，包含 `content`、`images`、`tags`、`location`、`user`、`like_count`、`comment_count`。

### 2.3 发布帖子
- **URL**: `/posts`
- **Method**: `POST`
- **鉴权**: 是
- **Body 参数**:
  - `post_type` (String, 必填): `work` 或 `daily`
  - `title` (String, 可选): 标题
  - `content` (String, 必填): 正文
  - `images` (Array<String>, 必填): 图片 URL 数组
  - `location` (String, 可选): 定位信息
  - `tags` (Array<String>, 可选): 标签字符串数组
- **业务规则**: `images[0]` 将被后端自动提取为 `cover_image`。

### 2.4 删除帖子
- **URL**: `/posts/:id`
- **Method**: `DELETE`
- **鉴权**: 是
- **业务规则**: 只能删除自己的帖子，执行软删除 (`is_deleted=1`)。

### 2.5 点赞帖子
- **URL**: `/likes/posts/:postId`
- **Method**: `POST`
- **鉴权**: 是
- **返回数据**: `{ "like_count": 121, "liked": true }`

### 2.6 取消点赞
- **URL**: `/likes/posts/:postId`
- **Method**: `DELETE`
- **鉴权**: 是
- **返回数据**: `{ "like_count": 120, "liked": false }`

### 2.7 查询点赞状态
- **URL**: `/likes/posts/:postId/status`
- **Method**: `GET`
- **鉴权**: 是
- **返回数据**: `{ "like_count": 120, "liked": false }`

---

## 3. 评论模块 (Comment)

### 3.1 获取帖子评论列表
- **URL**: `/comments?post_id=:id`
- **Method**: `GET`
- **鉴权**: 否
- **返回数据**:
  ```json
  {
    "total": 15,
    "list": [
      {
        "id": 100,
        "post_id": 1,
        "user_id": 20,
        "content": "拍得真好！",
        "created_at": 1774888000000,
        "parent_id": null,
        "reply_user_id": null,
        "user": { "id": 20, "nickname": "路人甲", "avatar": "url" }
      }
    ]
  }
  ```

### 3.2 发表评论
- **URL**: `/comments`
- **Method**: `POST`
- **鉴权**: 是
- **Body 参数**:
  - `post_id` (Number, 必填): 所属帖子 ID
  - `content` (String, 必填): 评论内容
  - `parent_id` (Number, 可选): 回复的父级评论 ID
  - `reply_user_id` (Number, 可选): 被回复用户的 ID

---

## 4. 活动模块 (Event)

### 4.1 获取活动列表
- **URL**: `/events`
- **Method**: `GET`
- **鉴权**: 否
- **Query 参数**: `page`, `pageSize`, `type` (`info` / `official`)
- **返回数据**: 列表与详情字段保持一致，空字段统一返回空字符串或 `null`。

### 4.2 获取活动详情
- **URL**: `/events/:id`
- **Method**: `GET`
- **鉴权**: 否

### 4.3 报名活动
- **URL**: `/events/:id/register`
- **Method**: `POST`
- **鉴权**: 是
- **Body 参数**: 无
- **业务规则**: 仅 `official` 类型可报名；检查截止时间与名额。
- **返回数据**: `{ "registered": true }`

### 4.4 查询报名状态
- **URL**: `/events/:id/register/status`
- **Method**: `GET`
- **鉴权**: 是
- **返回数据**: `{ "registered": true }`

### 4.5 查询我的报名
- **URL**: `/events/me/registrations`
- **Method**: `GET`
- **鉴权**: 是
- **返回数据**: `{ "list": Event[] }`，每项额外包含 `registered_at`

---

## 5. 需求模块 (Demand)

### 5.1 获取需求列表
- **URL**: `/demands`
- **Method**: `GET`
- **鉴权**: 否
- **Query 参数**: `page`, `pageSize`, `demand_type`
- **返回数据**: 列表单项与详情字段一致，统一包含 `author_id`、`user`、`deadline`、`participant_limit`。

### 5.2 获取需求详情
- **URL**: `/demands/:id`
- **Method**: `GET`
- **鉴权**: 否

### 5.3 发布需求
- **URL**: `/demands`
- **Method**: `POST`
- **鉴权**: 是
- **Body 参数**:
  - `demand_type`, `title`, `description`, `city`, `location`, `event_time`, `budget_type`, `budget_amount`, `participant_limit`
- **业务规则**: 发布后状态默认为 `OPEN`。

### 5.4 参与需求
- **URL**: `/demands/:id/apply`
- **Method**: `POST`
- **鉴权**: 是
- **Body 参数**: 无
- **业务规则**: 检查状态是否为 `OPEN`、是否截止、是否满员。
- **返回数据**: `{ "applied": true }`

### 5.5 查询参与状态
- **URL**: `/demands/:id/apply/status`
- **Method**: `GET`
- **鉴权**: 是
- **返回数据**: `{ "applied": true }`

### 5.6 查询我的发布/我的需求
- **URL**: `/demands/me`
- **Method**: `GET`
- **鉴权**: 是
- **Query 参数**: `page`, `pageSize`

### 5.7 查询我的参与
- **URL**: `/demands/me/applied`
- **Method**: `GET`
- **鉴权**: 是
- **返回数据**: `{ "list": Demand[] }`，每项额外包含 `applied_at`
