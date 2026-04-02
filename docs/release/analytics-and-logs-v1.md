# 粤次元君 - 轻量级埋点与基础日志建议 V1

## 一、目标

当前阶段不做复杂数据平台，也不追求完整 BI 体系，先建立一套“够排查、够复盘、够优化”的最小埋点与日志方案。

核心原则：

- 前端只埋关键行为，不做页面级全量埋点
- 后端只记关键业务动作和失败原因，不打印大段无用日志
- 先保证能回答“用户做了什么、在哪里失败、失败原因是什么”

## 二、当前现状

基于当前项目检查结果：

- 前端已具备明确的关键成功动作与页面入口，但未发现统一埋点实现
- 后端未发现统一 `Logger` 或结构化业务日志实现
- 当前 MVP 已有明确闭环动作，适合先埋“成功 / 失败 / 关键入口”三类事件

## 三、前端埋点建议

### 3.1 建议优先埋点范围

本阶段优先记录以下行为：

| 场景 | 是否必埋 | 目的 |
| --- | --- | --- |
| 首页访问 | 是 | 判断核心流量入口是否被访问 |
| 帖子点击 | 是 | 判断内容消费入口与点击偏好 |
| 发布成功 | 是 | 判断内容生产是否形成闭环 |
| 活动报名成功 | 是 | 判断官方活动转化情况 |
| 需求参与成功 | 是 | 判断需求协作链路是否形成闭环 |
| 编辑资料成功 | 建议 | 判断个人中心链路是否被使用 |

### 3.2 推荐事件命名

建议统一使用英文事件名，字段保持小写下划线风格。

| 事件名 | 触发时机 | 建议字段 |
| --- | --- | --- |
| `home_view` | 首页加载完成且成功展示内容时 | `page`, `tab`, `is_mock_mode`, `user_id` |
| `post_click` | 用户点击帖子卡片进入详情时 | `post_id`, `from_page`, `tab`, `author_id`, `post_type` |
| `post_publish_success` | 发帖成功 toast 前后 | `post_id`, `post_type`, `image_count`, `tag_count` |
| `event_register_success` | 活动报名成功时 | `event_id`, `event_type`, `from_page` |
| `demand_apply_success` | 需求参与成功时 | `demand_id`, `demand_type`, `from_page` |
| `profile_edit_success` | 编辑资料保存成功时 | `user_id`, `role_type`, `city` |

### 3.3 建议字段最小集合

所有前端埋点建议至少带：

- `event_name`
- `timestamp`
- `page`
- `user_id`
- `env`
- `app_version`

按需补充业务字段：

- `post_id`
- `event_id`
- `demand_id`
- `post_type`
- `event_type`
- `demand_type`
- `from_page`
- `result`

### 3.4 页面落点建议

| 页面 / 模块 | 建议埋点 |
| --- | --- |
| 首页 | `home_view` |
| 首页 / 发现页帖子卡片点击 | `post_click` |
| 发布帖子成功 | `post_publish_success` |
| 发布需求成功 | 可选补 `demand_publish_success` |
| 活动详情报名成功 | `event_register_success` |
| 需求详情参与成功 | `demand_apply_success` |
| 编辑资料成功 | `profile_edit_success` |

### 3.5 埋点触发建议

建议只在明确成功或明确进入关键页面时触发：

- 页面访问类：在页面核心数据加载成功后触发，不要在页面组件刚挂载就打点
- 成功类：在接口成功且 UI 已反馈成功后触发
- 点击类：点击后先记录意图，再跳转

不建议当前阶段埋：

- 输入框逐字输入
- 所有按钮点击
- 纯 UI 切换且无业务价值的动作

## 四、前端埋点字段示例

### 4.1 首页访问

```json
{
  "event_name": "home_view",
  "timestamp": 1775059200000,
  "page": "pages/home/index",
  "tab": "recommend",
  "user_id": "1",
  "env": "test",
  "app_version": "v0.5.0"
}
```

### 4.2 帖子点击

```json
{
  "event_name": "post_click",
  "timestamp": 1775059201000,
  "page": "pages/home/index",
  "from_page": "home",
  "post_id": "101",
  "post_type": "work",
  "author_id": "1",
  "user_id": "1"
}
```

### 4.3 发布成功

```json
{
  "event_name": "post_publish_success",
  "timestamp": 1775059202000,
  "page": "pages/publish-post/index",
  "post_id": "102",
  "post_type": "daily",
  "image_count": 3,
  "tag_count": 2,
  "user_id": "1"
}
```

## 五、后端日志建议

### 5.1 最小日志范围

后端建议至少记录以下业务动作：

| 日志场景 | 是否必记 | 目的 |
| --- | --- | --- |
| 登录 | 是 | 排查会话建立、鉴权与账号问题 |
| 发帖 | 是 | 排查发布成功率与重复提交问题 |
| 评论 | 是 | 排查互动链路和异常评论 |
| 报名 | 是 | 排查活动报名结果与失败原因 |
| 参与 | 是 | 排查需求参与结果与失败原因 |
| 上传失败 | 是 | 排查上传故障和接口错误 |

### 5.2 推荐日志结构

建议采用统一结构化日志字段：

- `action`
- `user_id`
- `target_id`
- `target_type`
- `result`
- `reason`
- `request_id`
- `timestamp`

### 5.3 推荐日志动作

| 动作 | 建议 `action` | 关键字段 |
| --- | --- | --- |
| 登录成功 | `auth_login_success` | `user_id`, `mock_id`, `request_id` |
| 登录失败 | `auth_login_failed` | `mock_id`, `reason`, `request_id` |
| 发帖成功 | `post_create_success` | `user_id`, `post_id`, `post_type` |
| 发帖失败 | `post_create_failed` | `user_id`, `reason` |
| 评论成功 | `comment_create_success` | `user_id`, `post_id`, `comment_id` |
| 评论失败 | `comment_create_failed` | `user_id`, `post_id`, `reason` |
| 活动报名成功 | `event_register_success` | `user_id`, `event_id` |
| 活动报名失败 | `event_register_failed` | `user_id`, `event_id`, `reason` |
| 需求参与成功 | `demand_apply_success` | `user_id`, `demand_id` |
| 需求参与失败 | `demand_apply_failed` | `user_id`, `demand_id`, `reason` |
| 上传失败 | `upload_failed` | `user_id`, `reason`, `filename` |

## 六、后端日志内容建议

### 6.1 登录

记录建议：

- 登录方式
- 用户 ID
- 请求来源
- 是否成功
- 失败原因

不建议记录：

- token 明文
- 整个 Authorization header

### 6.2 发帖 / 评论

记录建议：

- 发起人 `user_id`
- 内容对象 `post_id`
- 是否成功
- 失败原因

不建议记录：

- 全量正文内容
- 敏感隐私原文

### 6.3 报名 / 参与

记录建议：

- `event_id` / `demand_id`
- `user_id`
- 是否成功
- 原因：已报名、已截止、已满员、已关闭等

### 6.4 上传失败

记录建议：

- `user_id`
- 文件名或后缀
- 失败原因
- 请求链路 ID

## 七、失败日志优先级建议

优先记录这些失败原因，方便后续排查：

- `unauthorized`
- `duplicate submit`
- `already registered`
- `already applied`
- `deadline passed`
- `full`
- `closed`
- `file required`
- `upload response invalid`

## 八、落地方式建议

### 8.1 前端

MVP 阶段建议先封装一个轻量事件上报方法：

- 方法名示例：`track(eventName, payload)`
- 开发环境可先输出到控制台
- 测试 / 预上线环境可先发到一个简单采集接口或暂存在日志服务

### 8.2 后端

MVP 阶段建议：

- 在 `auth`、`posts`、`comments`、`event-registration`、`demand-application`、`uploads` 模块增加统一业务日志
- 优先使用结构化日志
- 每条业务日志都尽量带 `request_id`

## 九、优先级建议

### P0：本阶段建议尽快具备

- 首页访问埋点
- 帖子点击埋点
- 发布成功埋点
- 活动报名成功埋点
- 需求参与成功埋点
- 登录 / 发帖 / 评论 / 报名 / 参与 / 上传失败日志

### P1：后续补充

- 发布失败埋点
- 页面错误埋点
- 搜索、筛选、tab 切换埋点
- 后端 `request_id` 串联

## 十、上线前最小 Checklist

- [ ] 已确定统一埋点事件命名
- [ ] 首页访问已可留痕
- [ ] 帖子点击已可留痕
- [ ] 发布成功已可留痕
- [ ] 活动报名成功已可留痕
- [ ] 需求参与成功已可留痕
- [ ] 后端登录日志已可查
- [ ] 后端发帖日志已可查
- [ ] 后端评论日志已可查
- [ ] 后端报名日志已可查
- [ ] 后端参与日志已可查
- [ ] 后端上传失败日志已可查

## 十一、可直接丢给 Trae 的 Prompt

请为“粤次元君”整理轻量级埋点和基础日志建议。

要求：

1. 前端埋点至少包含：首页访问、帖子点击、发布成功、活动报名成功、需求参与成功
2. 后端日志建议至少包含：登录、发帖、评论、报名、参与、上传失败
3. 方案要面向 MVP，轻量可落地
4. 需要给出建议事件名、关键字段、日志结构和上线前 checklist
