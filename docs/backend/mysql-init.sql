-- Pivix database initialization script.
-- MySQL 8.0+, utf8mb4.
-- Keep this file aligned with backend/src/database/entities.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `post_tags`;
DROP TABLE IF EXISTS `tags`;
DROP TABLE IF EXISTS `banners`;
DROP TABLE IF EXISTS `demand_applications`;
DROP TABLE IF EXISTS `demands`;
DROP TABLE IF EXISTS `event_registrations`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `likes`;
DROP TABLE IF EXISTS `comments`;
DROP TABLE IF EXISTS `post_images`;
DROP TABLE IF EXISTS `posts`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `openid` VARCHAR(128) DEFAULT NULL,
  `unionid` VARCHAR(128) DEFAULT NULL,
  `nickname` VARCHAR(64) NOT NULL,
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `bg_url` VARCHAR(255) DEFAULT NULL,
  `avatar_pending` VARCHAR(255) DEFAULT NULL,
  `avatar_review_status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPROVED',
  `avatar_review_reason` VARCHAR(255) DEFAULT NULL,
  `bio` VARCHAR(255) DEFAULT NULL,
  `city` VARCHAR(64) DEFAULT NULL,
  `role_type` VARCHAR(32) NOT NULL DEFAULT 'user',
  `followers_count` INT NOT NULL DEFAULT 0,
  `following_count` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_openid` (`openid`),
  KEY `idx_users_unionid` (`unionid`),
  KEY `idx_users_avatar_review_status` (`avatar_review_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `posts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `author_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT DEFAULT NULL,
  `cover_image` VARCHAR(512) DEFAULT NULL,
  `tags` TEXT DEFAULT NULL,
  `tags_json` JSON DEFAULT NULL,
  `location` VARCHAR(128) DEFAULT NULL,
  `post_type` VARCHAR(32) NOT NULL DEFAULT 'daily',
  `like_count` INT NOT NULL DEFAULT 0,
  `comment_count` INT NOT NULL DEFAULT 0,
  `moderation_status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPROVED',
  `moderation_reason` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_posts_author_id` (`author_id`),
  KEY `idx_posts_type_review_created` (`post_type`, `moderation_status`, `created_at`),
  CONSTRAINT `fk_posts_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `post_images` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `post_id` BIGINT UNSIGNED NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_post_images_post_id` (`post_id`),
  CONSTRAINT `fk_post_images_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `comments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `post_id` BIGINT UNSIGNED NOT NULL,
  `author_id` BIGINT UNSIGNED NOT NULL,
  `content` TEXT NOT NULL,
  `parent_id` BIGINT UNSIGNED DEFAULT NULL,
  `reply_user_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comments_post_id` (`post_id`),
  KEY `idx_comments_author_id` (`author_id`),
  KEY `idx_comments_parent_id` (`parent_id`),
  CONSTRAINT `fk_comments_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`),
  CONSTRAINT `fk_comments_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `likes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `post_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_likes_post_user` (`post_id`, `user_id`),
  KEY `idx_likes_user_id` (`user_id`),
  CONSTRAINT `fk_likes_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`),
  CONSTRAINT `fk_likes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `events` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `cover_image` VARCHAR(512) DEFAULT NULL,
  `cover_url` VARCHAR(512) DEFAULT NULL,
  `start_time` DATETIME DEFAULT NULL,
  `end_time` DATETIME DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(10,2) DEFAULT NULL,
  `organizer` VARCHAR(128) DEFAULT NULL,
  `status` ENUM('UPCOMING', 'ONGOING', 'ENDED') NOT NULL DEFAULT 'UPCOMING',
  `event_type` VARCHAR(16) NOT NULL DEFAULT 'info',
  `capacity` INT DEFAULT NULL,
  `registration_deadline` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_events_status_start_time` (`status`, `start_time`),
  KEY `idx_events_type_status` (`event_type`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `event_registrations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `event_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `form_data_json` JSON DEFAULT NULL,
  `registration_status` TINYINT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_event_registrations_event_user` (`event_id`, `user_id`),
  KEY `idx_event_registrations_user_id` (`user_id`),
  CONSTRAINT `fk_event_registrations_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`),
  CONSTRAINT `fk_event_registrations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `demands` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `author_id` BIGINT UNSIGNED NOT NULL,
  `demand_type` ENUM('PHOTOGRAPHY', 'MAKEUP', 'COSER', 'RETOUCH', 'OTHER') NOT NULL,
  `accepted_application_id` BIGINT UNSIGNED DEFAULT NULL,
  `accepted_user_id` BIGINT UNSIGNED DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `city` VARCHAR(128) DEFAULT NULL,
  `location` VARCHAR(128) DEFAULT NULL,
  `event_time` DATETIME DEFAULT NULL,
  `budget_type` VARCHAR(32) DEFAULT NULL,
  `budget_amount` DECIMAL(10,2) DEFAULT NULL,
  `participant_limit` INT NOT NULL DEFAULT 1,
  `deadline` DATETIME DEFAULT NULL,
  `status` ENUM('OPEN', 'COMPLETED', 'CANCEL_PENDING', 'CANCELLED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
  `time_change_requested_by` BIGINT UNSIGNED DEFAULT NULL,
  `requested_event_time` DATETIME DEFAULT NULL,
  `cancel_requested_by` BIGINT UNSIGNED DEFAULT NULL,
  `cancel_requested_at` DATETIME DEFAULT NULL,
  `cancelled_at` DATETIME DEFAULT NULL,
  `moderation_status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPROVED',
  `moderation_reason` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_demands_author_id` (`author_id`),
  KEY `idx_demands_status_event_time` (`status`, `event_time`),
  KEY `idx_demands_review_status` (`moderation_status`),
  CONSTRAINT `fk_demands_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `demand_applications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `demand_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `status` ENUM('APPLIED', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPLIED',
  `apply_message` VARCHAR(512) DEFAULT NULL,
  `publisher_accepted_at` DATETIME DEFAULT NULL,
  `applicant_confirmed_at` DATETIME DEFAULT NULL,
  `cancel_requested_by` VARCHAR(16) DEFAULT NULL,
  `cancel_requested_at` DATETIME DEFAULT NULL,
  `publisher_cancel_confirmed_at` DATETIME DEFAULT NULL,
  `applicant_cancel_confirmed_at` DATETIME DEFAULT NULL,
  `cancelled_at` DATETIME DEFAULT NULL,
  `exit_requested_at` DATETIME DEFAULT NULL,
  `exit_approved_at` DATETIME DEFAULT NULL,
  `time_change_confirmed_at` DATETIME DEFAULT NULL,
  `demand_cancel_confirmed_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_demand_applications_demand_user` (`demand_id`, `user_id`),
  KEY `idx_demand_applications_user_id` (`user_id`),
  KEY `idx_demand_applications_status` (`status`),
  KEY `idx_demand_applications_exit_requested` (`demand_id`, `exit_requested_at`),
  CONSTRAINT `fk_demand_applications_demand` FOREIGN KEY (`demand_id`) REFERENCES `demands` (`id`),
  CONSTRAINT `fk_demand_applications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `banners` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(64) DEFAULT NULL,
  `image_url` VARCHAR(512) NOT NULL,
  `jump_link` VARCHAR(512) DEFAULT NULL,
  `position` VARCHAR(32) NOT NULL DEFAULT 'home_top',
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` TINYINT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_banners_position_status` (`position`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tags` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tag_name` VARCHAR(32) NOT NULL,
  `status` TINYINT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tags_tag_name` (`tag_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `post_tags` (
  `post_id` BIGINT UNSIGNED NOT NULL,
  `tag_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`, `tag_id`),
  KEY `idx_post_tags_tag_id` (`tag_id`),
  CONSTRAINT `fk_post_tags_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`),
  CONSTRAINT `fk_post_tags_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `demands`
  ADD CONSTRAINT `fk_demands_accepted_application`
    FOREIGN KEY (`accepted_application_id`) REFERENCES `demand_applications` (`id`),
  ADD CONSTRAINT `fk_demands_accepted_user`
    FOREIGN KEY (`accepted_user_id`) REFERENCES `users` (`id`);

SET FOREIGN_KEY_CHECKS = 1;
