# 粤次元君 (Yue Ci Yuan Jun) - 数据库设计 V1 修订版

本文档是对第 0 阶段 `database-design.md` 的修订升级。结合前期的**页面字段清单**和**API 详细规格**，我们对数据库结构进行了以下关键性调整，使其达到了“可直接用于开发”的成熟度。

## 核心修订说明 (V0 -> V1)
1. **软删除支持**: 在 `users`, `posts`, `comments` 表中增加 `is_deleted` (TINYINT) 字段。
2. **状态机统一**: 所有核心业务表的 `status` 字段统一规范（例如发布状态 `publish_status`）。
3. **扩展性增强**: 
   - `event_registrations` 增加了 `form_data_json` 用于存储动态报名表单。
   - `comments` 明确了 `parent_id` 和 `reply_user_id`，支持楼中楼回复。
   - `demands` 和 `events` 增加了 `publish_status` 控制草稿/发布状态。
4. **时间追踪**: 增加了 `last_login_at` 等追踪字段。

---

## 1. 表结构详情

### 1.1 用户表 (`users`)
| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INC | - | 用户ID |
| `openid` | VARCHAR(100) | UNIQUE, NOT NULL| - | 微信 OpenID |
| `unionid` | VARCHAR(100) | UNIQUE | NULL | 微信 UnionID |
| `nickname` | VARCHAR(50) | NOT NULL | '微信用户' | 昵称 |
| `avatar` | VARCHAR(255) | NULL | NULL | 头像URL |
| `gender` | TINYINT | NOT NULL | 0 | 0-未知, 1-男, 2-女 |
| `bio` | VARCHAR(200) | NULL | NULL | 个人简介 |
| `city` | VARCHAR(50) | NULL | NULL | 城市 |
| `status` | TINYINT | NOT NULL | 1 | 1-正常, 0-禁用 |
| `is_deleted`| TINYINT | NOT NULL | 0 | 1-已注销/删除 |
| `last_login_at`| TIMESTAMP | NULL | NULL | 最后登录时间 |
| `created_at`| TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 注册时间 |
| `updated_at`| TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

### 1.2 帖子表 (`posts`)
| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INC | - | 帖子ID |
| `user_id` | BIGINT UNSIGNED | INDEX, NOT NULL | - | 作者ID |
| `post_type` | VARCHAR(20) | NOT NULL | 'work' | 'work'(作品) / 'daily'(日常) |
| `title` | VARCHAR(100) | NULL | NULL | 标题 (日常可为空) |
| `content` | TEXT | NOT NULL | - | 正文内容 |
| `cover_image` | VARCHAR(255) | NOT NULL | - | 封面图URL |
| `location` | VARCHAR(100) | NULL | NULL | 拍摄地点 |
| `like_count` | INT UNSIGNED | NOT NULL | 0 | 点赞统计 |
| `comment_count`| INT UNSIGNED | NOT NULL | 0 | 评论统计 |
| `publish_status`| TINYINT | NOT NULL | 1 | 0-草稿, 1-已发布 |
| `is_deleted` | TINYINT | NOT NULL | 0 | 1-已删除 |
| `created_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | - |
| `updated_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | - |

### 1.3 帖子图片表 (`post_images`)
| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INC | - | 主键 |
| `post_id` | BIGINT UNSIGNED | INDEX, NOT NULL | - | 关联帖子ID |
| `image_url` | VARCHAR(255) | NOT NULL | - | 图片URL |
| `sort_order` | INT | NOT NULL | 0 | 排序值 (越小越靠前) |
| `created_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | - |

### 1.4 评论表 (`comments`)
| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INC | - | 主键 |
| `post_id` | BIGINT UNSIGNED | INDEX, NOT NULL | - | 所属帖子ID |
| `user_id` | BIGINT UNSIGNED | NOT NULL | - | 评论者ID |
| `parent_id` | BIGINT UNSIGNED | INDEX | NULL | 父级评论ID (楼中楼) |
| `reply_user_id`| BIGINT UNSIGNED | NULL | NULL | 被回复者ID |
| `content` | TEXT | NOT NULL | - | 评论内容 |
| `is_deleted` | TINYINT | NOT NULL | 0 | 1-已删除 |
| `created_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | - |
| `updated_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | - |

### 1.5 点赞表 (`likes`) - 多态设计
| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INC | - | 主键 |
| `user_id` | BIGINT UNSIGNED | NOT NULL | - | 点赞者ID |
| `target_type` | VARCHAR(20) | NOT NULL | 'post' | 目标类型: 'post', 'comment' |
| `target_id` | BIGINT UNSIGNED | NOT NULL | - | 目标实体ID |
| `created_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | - |
> **索引要求**: `(user_id, target_type, target_id)` 建立联合唯一索引，防止重复点赞。

### 1.6 活动表 (`events`)
| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INC | - | 主键 |
| `event_type` | VARCHAR(20) | NOT NULL | 'news' | 'news'(资讯) / 'activity'(报名活动) |
| `title` | VARCHAR(100) | NOT NULL | - | 标题 |
| `cover_image` | VARCHAR(255) | NOT NULL | - | 封面大图 |
| `summary` | VARCHAR(200) | NULL | NULL | 摘要 |
| `content` | TEXT | NOT NULL | - | 详细内容(富文本) |
| `city` | VARCHAR(50) | NULL | NULL | 举办城市 |
| `location` | VARCHAR(100) | NULL | NULL | 具体地点 |
| `start_time` | DATETIME | NOT NULL | - | 开始时间 |
| `end_time` | DATETIME | NULL | NULL | 结束时间 |
| `registration_deadline` | DATETIME | NULL | NULL | 报名截止时间 |
| `max_participants`| INT UNSIGNED | NULL | NULL | 最大人数 (NULL表示不限) |
| `current_participants`| INT UNSIGNED| NOT NULL | 0 | 当前已报名人数 |
| `publish_status`| TINYINT | NOT NULL | 1 | 0-草稿, 1-已发布 |
| `status` | TINYINT | NOT NULL | 1 | 1-报名中, 2-进行中, 3-已结束 |
| `is_deleted` | TINYINT | NOT NULL | 0 | - |
| `created_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | - |
| `updated_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | - |

### 1.7 活动报名表 (`event_registrations`)
| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INC | - | 主键 |
| `event_id` | BIGINT UNSIGNED | INDEX, NOT NULL | - | 关联活动ID |
| `user_id` | BIGINT UNSIGNED | NOT NULL | - | 报名用户ID |
| `form_data_json`| JSON | NULL | NULL | 动态收集的表单数据(如姓名手机) |
| `status` | TINYINT | NOT NULL | 1 | 1-已报名, 0-已取消 |
| `created_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | - |
> **索引要求**: `(event_id, user_id)` 联合唯一索引。

### 1.8 需求表 (`demands`)
| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INC | - | 主键 |
| `user_id` | BIGINT UNSIGNED | INDEX, NOT NULL | - | 发布者ID |
| `demand_type` | VARCHAR(20) | NOT NULL | - | 'photography', 'model', 'makeup' 等 |
| `title` | VARCHAR(100) | NOT NULL | - | 标题 |
| `description` | TEXT | NOT NULL | - | 详细要求 |
| `city` | VARCHAR(50) | NOT NULL | - | 城市 |
| `location` | VARCHAR(100) | NULL | NULL | 具体地点 |
| `event_time` | DATETIME | NULL | NULL | 期望时间 |
| `budget_type` | VARCHAR(20) | NOT NULL | 'free' | 'free'(互免) / 'paid'(有偿) / 'negotiable' |
| `budget_amount` | DECIMAL(10,2) | NULL | NULL | 预算金额 |
| `participant_limit`| INT UNSIGNED | NOT NULL | 1 | 需要人数 |
| `current_participants`| INT UNSIGNED| NOT NULL | 0 | 已确认人数 |
| `publish_status`| TINYINT | NOT NULL | 1 | 0-草稿, 1-已发布 |
| `status` | TINYINT | NOT NULL | 1 | 1-招募中, 2-已满员, 0-已下架 |
| `is_deleted` | TINYINT | NOT NULL | 0 | - |
| `created_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | - |
| `updated_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | - |

### 1.9 需求参与表 (`demand_applications`)
| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|---|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INC | - | 主键 |
| `demand_id` | BIGINT UNSIGNED | INDEX, NOT NULL | - | 关联需求ID |
| `user_id` | BIGINT UNSIGNED | NOT NULL | - | 申请者ID |
| `apply_message` | VARCHAR(255) | NOT NULL | - | 申请留言 |
| `status` | TINYINT | NOT NULL | 0 | 0-待审核, 1-已通过, 2-已拒绝, -1-已取消 |
| `cancel_reason` | VARCHAR(100) | NULL | NULL | 拒绝/取消原因 |
| `created_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | - |
| `updated_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | - |
> **索引要求**: `(demand_id, user_id)` 联合唯一索引。