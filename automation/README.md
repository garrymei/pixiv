# 广东二次元每日内容任务

服务器定时器 `pivix-guangdong-anime-daily.timer` 每天北京时间 09:00 调用
`run-guangdong-anime-daily.sh`。执行报告、原始运行日志和去重台账分别保存在
`logs/`、`run-logs/` 和 `state/`。

查看状态：

```bash
systemctl status pivix-guangdong-anime-daily.timer
systemctl status pivix-guangdong-anime-daily.service
journalctl -u pivix-guangdong-anime-daily.service
```
