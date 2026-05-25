-- WeChat login identity migration.
-- Run after backup. MySQL 8.0+.

ALTER TABLE `users`
  ADD COLUMN `openid` VARCHAR(128) NULL AFTER `id`,
  ADD COLUMN `unionid` VARCHAR(128) NULL AFTER `openid`;

CREATE UNIQUE INDEX `uk_users_openid` ON `users` (`openid`);
CREATE INDEX `idx_users_unionid` ON `users` (`unionid`);
