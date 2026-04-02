# 粤次元君 API 模块边界设计文档

## 概述
本文档定义了“粤次元君”MVP 阶段的核心 API 模块边界。这些接口主要用于支撑前端小程序阶段一的假数据结构定义，以及阶段二后端开发。所有接口遵循 RESTful 规范。

## 统一响应结构
所有接口的返回数据统一封装为以下格式：

```json
{
  "code": 0,           // 业务状态码，0 表示成功，非 0 表示错误
  "msg": "success",    // 提示信息
  "data": {}           // 具体返回数据，如果出错可能为 null
}
```

### 全局错误码建议
| 错误码 | 含义 |
|---|---|
| 0 | 成功 |
| 400 | 参数错误 (Bad Request) |
| 401 | 未登录或 token 过期 (Unauthorized) |
| 403 | 无权限操作 (Forbidden) |
| 404 | 资源不存在 (Not Found) |
| 500 | 服务器内部错误 (Internal Server Error) |

---

## 1. 用户模块 (User)

### 1.1 微信登录
- **用途**：通过微信 code 换取系统 token，若新用户则自动注册。
- **URL**：`/api/v1/auth/wechat-login`
- **请求方法**：`POST`
- **请求参数**：
  ```json
  {
    "code": "wx_login_code"
  }
  ```
- **返回结构**：
  ```json
  {
    "token": "jwt_token_string",
    "user": {
      "id": 1,
      "nickname": "次元萌新",
      "avatar": "url",
      "isNew": true // 是否为新注册用户
    }
  }
  ```

### 1.2 获取当前用户信息
- **用途**：获取已登录用户的详细信息。
- **URL**：`/api/v1/users/me`
- **请求方法**：`GET`
- **请求参数**：无 (Header 中携带 Token)
- **返回结构**：
  ```json
  {
    "id": 1,
    "nickname": "次元萌新",
    "avatar": "url",
    "gender": 1,
    "bio": "热爱二次元的摄影小白",
    "city": "广州"
  }
  ```

### 1.3 更新个人信息
- **用途**：修改用户昵称、头像、简介等。
- **URL**：`/api/v1/users/me`
- **请求方法**：`PUT`
- **请求参数**：
  ```json
  {
    "nickname": "新昵称",
    "avatar": "new_url",
    "bio": "新的简介",
    "city": "深圳"
  }
  ```
- **返回结构**：同 1.2

---

## 2. 帖子模块 (Post)

### 2.1 获取帖子列表
- **用途**：获取首页/发现页的作品或日常列表，支持分页。
- **URL**：`/api/v1/posts`
- **请求方法**：`GET`
- **请求参数** (Query)：
  - `type` (可选): `work`(作品) 或 `daily`(日常)
  - `page`: 当前页码，默认 1
  - `size`: 每页数量，默认 10
- **返回结构**：
  ```json
  {
    "total": 100,
    "items": [
      {
        "id": 1,
        "title": "漫展返图",
        "cover_image": "url",
        "author": { "id": 1, "nickname": "摄影师A", "avatar": "url" },
        "like_count": 12,
        "comment_count": 5,
        "created_at": "2023-10-01T12:00:00Z"
      }
    ]
  }
  ```

### 2.2 获取帖子详情
- **用途**：查看单条帖子及其所有图片。
- **URL**：`/api/v1/posts/:id`
- **请求方法**：`GET`
- **请求参数**：路径参数 `id`
- **返回结构**：
  ```json
  {
    "id": 1,
    "type": "work",
    "title": "漫展返图",
    "content": "今天在漫展拍的正片...",
    "location": "广州保利世贸博览馆",
    "images": ["url1", "url2", "url3"],
    "tags": ["Cosplay", "返图"],
    "author": { "id": 1, "nickname": "摄影师A", "avatar": "url" },
    "like_count": 12,
    "comment_count": 5,
    "is_liked": false, // 当前登录用户是否已点赞
    "created_at": "2023-10-01T12:00:00Z"
  }
  ```

### 2.3 发布帖子
- **用途**：发布新的作品或日常。
- **URL**：`/api/v1/posts`
- **请求方法**：`POST`
- **请求参数**：
  ```json
  {
    "type": "work",
    "title": "漫展返图",
    "content": "正片内容",
    "images": ["url1", "url2"],
    "location": "广州保利世贸博览馆",
    "tags": ["Cosplay"]
  }
  ```
- **返回结构**：
  ```json
  {
    "id": 2, // 新生成的帖子ID
    "message": "发布成功"
  }
  ```

---

## 3. 评论模块 (Comment)

### 3.1 获取帖子评论列表
- **用途**：获取指定帖子下的评论，支持分页。
- **URL**：`/api/v1/posts/:postId/comments`
- **请求方法**：`GET`
- **请求参数** (Query)：
  - `page`: 默认 1
  - `size`: 默认 20
- **返回结构**：
  ```json
  {
    "total": 5,
    "items": [
      {
        "id": 1,
        "content": "拍得太棒了！",
        "author": { "id": 2, "nickname": "用户B", "avatar": "url" },
        "created_at": "2023-10-01T12:30:00Z",
        "reply_to": null // 如果是回复某人，这里会有被回复人的信息
      }
    ]
  }
  ```

### 3.2 发表评论
- **用途**：在帖子下留言，或回复他人的评论。
- **URL**：`/api/v1/posts/:postId/comments`
- **请求方法**：`POST`
- **请求参数**：
  ```json
  {
    "content": "拍得太棒了！",
    "parent_id": null, // 可选，如果是一级评论则为空，如果是楼中楼则为父评论ID
    "reply_user_id": null // 可选，回复的具体用户ID
  }
  ```
- **返回结构**：
  ```json
  {
    "id": 6, // 新评论ID
    "message": "评论成功"
  }
  ```

---

## 4. 活动模块 (Event)

### 4.1 获取活动列表
- **用途**：查看官方资讯或活动列表。
- **URL**：`/api/v1/events`
- **请求方法**：`GET`
- **请求参数** (Query)：
  - `type` (可选): `news`(资讯) 或 `activity`(官方活动)
  - `page`: 默认 1
  - `size`: 默认 10
- **返回结构**：
  ```json
  {
    "total": 20,
    "items": [
      {
        "id": 1,
        "title": "CICF 2023 中国国际漫画节动漫游戏展",
        "cover_image": "url",
        "city": "广州",
        "start_time": "2023-10-01T09:00:00Z",
        "status": 1 // 1: 报名中, 2: 进行中, 3: 已结束
      }
    ]
  }
  ```

### 4.2 报名活动
- **用途**：用户提交表单报名官方活动。
- **URL**：`/api/v1/events/:eventId/registrations`
- **请求方法**：`POST`
- **请求参数**：
  ```json
  {
    "form_data": {
      "real_name": "张三",
      "phone": "13800138000",
      "role": "coser"
    }
  }
  ```
- **返回结构**：
  ```json
  {
    "id": 1, // 报名记录ID
    "status": "pending", // 待审核
    "message": "报名提交成功"
  }
  ```

---

## 5. 需求模块 (Demand)

### 5.1 获取需求大厅列表
- **用途**：展示各种找人/组队的需求。
- **URL**：`/api/v1/demands`
- **请求方法**：`GET`
- **请求参数** (Query)：
  - `type` (可选): 摄影/模特/化妆等
  - `city` (可选): 城市过滤
  - `budget_type` (可选): free/paid/negotiable
  - `page`: 默认 1
  - `size`: 默认 10
- **返回结构**：
  ```json
  {
    "total": 50,
    "items": [
      {
        "id": 1,
        "type": "摄影",
        "title": "国庆求个原神Coser拍正片",
        "budget_type": "free", // 互免
        "city": "深圳",
        "event_time": "2023-10-03T10:00:00Z",
        "author": { "id": 1, "nickname": "摄影师A", "avatar": "url" }
      }
    ]
  }
  ```

### 5.2 申请参与需求
- **用途**：看到别人的需求后，申请加入（接单/组队）。
- **URL**：`/api/v1/demands/:demandId/applications`
- **请求方法**：`POST`
- **请求参数**：
  ```json
  {
    "message": "我有档期，可以出刻晴，这是我的主页看下返图。"
  }
  ```
- **返回结构**：
  ```json
  {
    "id": 1, // 申请记录ID
    "message": "申请已发送给发布者"
  }
  ```