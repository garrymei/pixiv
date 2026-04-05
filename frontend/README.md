# 粤次元君前端联调说明

## 接口模式切换

- mock / real 切换由 `src/services/request.ts` 统一控制
- 默认值来自构建配置
  - 开发环境：`API_MODE=mock`、`APP_ENV=local`
  - 产物环境：`API_MODE=real`、`APP_ENV=test`
- 运行时也可通过本地存储切换
  - `api_mode`：`mock` 或 `real`
  - `runtime_env`：`local` 或 `test`

## 地址配置

- 本地开发接口地址：`LOCAL_API_BASE_URL`
- 测试环境接口地址：`TEST_API_BASE_URL`
- 本地上传地址：`LOCAL_UPLOAD_BASE_URL`
- 测试上传地址：`TEST_UPLOAD_BASE_URL`
- 当前项目默认配置见 `config/dev.js` 与 `config/prod.js`

## 当前默认值

- 本地开发接口：`http://43.167.164.162:3000`
- 测试环境接口：`http://43.167.164.162:3000`
- 上传地址默认跟随对应环境 API 地址

## token 机制

- token 存储键：`auth_token`
- 当请求真实接口且接口需要鉴权时，会先自动调用 `POST /auth/login`
- 拿到 token 后通过 `Authorization: Bearer <token>` 自动透传
- 页面层不直接处理 token

## 图片上传

- 上传服务：`src/services/uploads.ts`
- 上传接口：`POST /uploads/image`
- 上传字段名：`file`
- 返回结构：`{ url }`
- 如果后端返回相对地址，会自动拼接上传域名

## 页面使用原则

- 页面层不直接写死接口地址
- 页面只调用 `src/services/*`
- mock 与 real 切换不需要改业务页面代码

## 切到真实接口的方法

- 方法一：修改构建配置默认值
  - 将 `config/dev.js` 中 `process.env.API_MODE` 改为 `real`
  - 保持 `process.env.APP_ENV` 为 `local` 或切到 `test`
- 方法二：运行时设置本地存储
  - `api_mode=real`
  - `runtime_env=local` 或 `runtime_env=test`

## 联调建议

- 本地联调时先启动 backend，并确保 `/auth/login`、`/users/me`、`/posts`、`/demands`、`/events`、`/profile/summary` 可访问
- 若切到真实接口后图片不显示，优先检查上传地址配置与后端 `/uploads` 静态资源暴露
