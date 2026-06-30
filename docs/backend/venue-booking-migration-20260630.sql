-- 场地预约模块表结构
-- 执行库：pivix

CREATE TABLE IF NOT EXISTS `venues` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `city` VARCHAR(128) NULL,
  `address` VARCHAR(255) NULL,
  `cover_image` VARCHAR(512) NULL,
  `description` TEXT NULL,
  `status` INT NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_venues_status_sort` (`status`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `venue_scenes` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `venue_id` BIGINT NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `image_url` VARCHAR(512) NULL,
  `description` TEXT NULL,
  `capacity` INT NULL,
  `status` INT NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_venue_scenes_venue_status_sort` (`venue_id`, `status`, `sort_order`),
  CONSTRAINT `fk_venue_scenes_venue` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `venue_bookings` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `venue_id` BIGINT NOT NULL,
  `scene_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `note` VARCHAR(255) NULL,
  `status` VARCHAR(16) NOT NULL DEFAULT 'CONFIRMED',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_venue_bookings_scene_time` (`scene_id`, `status`, `start_time`, `end_time`),
  KEY `idx_venue_bookings_user_time` (`user_id`, `start_time`),
  CONSTRAINT `fk_venue_bookings_venue` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`),
  CONSTRAINT `fk_venue_bookings_scene` FOREIGN KEY (`scene_id`) REFERENCES `venue_scenes` (`id`),
  CONSTRAINT `fk_venue_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
