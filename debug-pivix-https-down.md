# Debug Session: pivix-https-down
- **Status**: [OPEN]
- **Issue**: `https://www.pivix.top/` 无法正常访问
- **Debug Server**: N/A
- **Log File**: N/A

## Reproduction Steps
1. 访问 `https://www.pivix.top/`
2. 观察浏览器/命令行是否返回证书或连接错误

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | HTTPS 证书已过期，客户端在 TLS 阶段拦截 | High | Low | Confirmed |
| B | Nginx 443 server block 配置异常 | Med | Low | Rejected |
| C | 443 端口虽然监听，但返回了错误证书或错误站点 | Med | Low | Partially Confirmed |
| D | 80 到 443 的跳转正常，但 HTTPS 上游不可用 | Low | Low | Rejected |

## Log Evidence
- `curl -I https://www.pivix.top/` 当前仍报 `curl: (60) SSL certificate problem: certificate has expired`
- 对外证书：`notAfter=Jul 11 04:59:59 2026 GMT`
- 本机证书文件 `/etc/nginx/ssl/pivix.top/fullchain.pem`：`notAfter=Jul 11 04:59:59 2026 GMT`
- 本机证书文件时间仍是 `Apr 12 21:11`
- `curl -skI -H 'Host: www.pivix.top' https://127.0.0.1/` 返回 `HTTP/2 404`
- `curl -I http://www.pivix.top/` 仍返回 `301 Moved Permanently`

## Verification Conclusion
- HTTPS 监听正常，Nginx 443 server 可用。
- 当前“证书已更新”这一动作并未生效到 Nginx 实际使用的文件；服务器和对外流量看到的仍是 4 月 12 日那张旧证书。
- 即便后续证书修好，`/` 仍会被反向代理到后端并返回 404，首页路由问题依旧存在。
