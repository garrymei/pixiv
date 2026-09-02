-- App settings migration for global admin switches.
-- Run after backup. MySQL 8.0+.

CREATE TABLE IF NOT EXISTS `app_settings` (
  `id` BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  `publish_enabled` TINYINT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `app_settings` (`id`, `publish_enabled`)
VALUES (1, 0)
ON DUPLICATE KEY UPDATE
  `publish_enabled` = VALUES(`publish_enabled`);
