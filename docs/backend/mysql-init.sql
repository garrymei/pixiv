-- 粤次元君 (Yue Ci Yuan Jun) - MVP 阶段数据库初始化脚本
-- 数据库版本要求: MySQL 8.0+
-- 字符集: utf8mb4

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 1. users (用户表)
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `openid` VARCHAR(128) NOT NULL COMMENT '微信小程序 OpenID',
  `unionid` VARCHAR(128) DEFAULT NULL COMMENT '微信 UnionID (如果有)',
  `nickname` VARCHAR(64) NOT NULL DEFAULT '次元萌新' COMMENT '用户昵称',
  `avatar` VARCHAR(512) DEFAULT NULL COMMENT '用户头像 URL',
  `gender` TINYINT TINYINT(1) NOT NULL DEFAULT 0 COMMENT '性别: 0-未知, 1-男, 2-女',
  `bio` VARCHAR(255) DEFAULT NULL COMMENT '一句话简介/个性签名',
  `city` VARCHAR(64) DEFAULT NULL COMMENT '所在城市',
  `role_type` VARCHAR(32) NOT NULL DEFAULT 'user' COMMENT '角色类型: user-普通用户, admin-管理员',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常, 0-封禁',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  KEY `idx_unionid` (`unionid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户基础信息表';

-- ----------------------------
-- 2. posts (帖子/图文表)
-- ----------------------------
DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '发布者ID',
  `post_type` VARCHAR(16) NOT NULL DEFAULT 'daily' COMMENT '类型: works-作品, daily-日常',
  `title` VARCHAR(128) DEFAULT NULL COMMENT '标题 (日常可为空)',
  `content` TEXT NOT NULL COMMENT '文本内容',
  `cover_image` VARCHAR(512) DEFAULT NULL COMMENT '封面图 URL (冗余第一张图便于列表展示)',
  `location` VARCHAR(128) DEFAULT NULL COMMENT '发布定位',
  `like_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '点赞数(冗余字段)',
  `comment_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '评论数(冗余字段)',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常, 0-隐藏/审核中, -1-删除',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_post_type_status` (`post_type`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子/图文主表';

-- ----------------------------
-- 3. post_images (帖子图片表)
-- ----------------------------
DROP TABLE IF EXISTS `post_images`;
CREATE TABLE `post_images` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `post_id` BIGINT UNSIGNED NOT NULL COMMENT '关联的帖子ID',
  `image_url` VARCHAR(512) NOT NULL COMMENT '图片 URL',
  `sort_order` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序权重(越小越靠前)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_post_id` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子图片附表';

-- ----------------------------
-- 4. comments (评论表)
-- ----------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `post_id` BIGINT UNSIGNED NOT NULL COMMENT '关联的帖子ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '评论者ID',
  `parent_id` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '父评论ID (MVP设为0, 留作楼中楼扩展)',
  `reply_user_id` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '被回复者ID',
  `content` VARCHAR(1024) NOT NULL COMMENT '评论内容',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常, 0-隐藏, -1-删除',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_post_id` (`post_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子评论表';

-- ----------------------------
-- 5. likes (点赞记录表)
-- ----------------------------
DROP TABLE IF EXISTS `likes`;
CREATE TABLE `likes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '点赞者ID',
  `target_type` VARCHAR(16) NOT NULL COMMENT '目标类型: post-帖子, comment-评论',
  `target_id` BIGINT UNSIGNED NOT NULL COMMENT '目标实体ID',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_target` (`user_id`, `target_type`, `target_id`),
  KEY `idx_target` (`target_type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='统一多态点赞表';

-- ----------------------------
-- 6. events (活动/资讯表)
-- ----------------------------
DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `event_type` VARCHAR(16) NOT NULL DEFAULT 'info' COMMENT '类型: info-纯资讯, official-需报名的官方活动',
  `title` VARCHAR(128) NOT NULL COMMENT '活动标题',
  `cover_image` VARCHAR(512) NOT NULL COMMENT '活动封面图',
  `summary` VARCHAR(255) DEFAULT NULL COMMENT '列表摘要',
  `content` TEXT NOT NULL COMMENT '活动富文本详情',
  `city` VARCHAR(64) DEFAULT NULL COMMENT '举办城市',
  `location` VARCHAR(255) DEFAULT NULL COMMENT '详细地址',
  `start_time` DATETIME DEFAULT NULL COMMENT '活动开始时间',
  `end_time` DATETIME DEFAULT NULL COMMENT '活动结束时间',
  `registration_deadline` DATETIME DEFAULT NULL COMMENT '报名截止时间',
  `max_participants` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '人数上限(0为不限)',
  `current_participants` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '当前已报名人数',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常发布, 0-草稿/下架',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_city` (`city`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动与资讯表';

-- ----------------------------
-- 7. event_registrations (活动报名表)
-- ----------------------------
DROP TABLE IF EXISTS `event_registrations`;
CREATE TABLE `event_registrations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `event_id` BIGINT UNSIGNED NOT NULL COMMENT '活动ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '报名用户ID',
  `form_data_json` JSON DEFAULT NULL COMMENT '收集的表单数据 (如联系人、电话等)',
  `registration_status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-已报名, 2-已签到, 0-已取消',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_event_user` (`event_id`, `user_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动报名记录表';

-- ----------------------------
-- 8. demands (协作需求表)
-- ----------------------------
DROP TABLE IF EXISTS `demands`;
CREATE TABLE `demands` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '发布者ID',
  `demand_type` VARCHAR(32) NOT NULL COMMENT '需求类型: 摄影/模特/化妆/毛发/道具/后期',
  `title` VARCHAR(128) NOT NULL COMMENT '需求标题',
  `description` TEXT NOT NULL COMMENT '详细要求描述',
  `city` VARCHAR(64) DEFAULT NULL COMMENT '城市',
  `location` VARCHAR(128) DEFAULT NULL COMMENT '具体地点',
  `event_time` DATETIME DEFAULT NULL COMMENT '期望协作时间',
  `budget_type` VARCHAR(16) NOT NULL DEFAULT 'negotiable' COMMENT '预算类型: free-互免, paid-有偿, negotiable-待议',
  `budget_amount` DECIMAL(10,2) DEFAULT NULL COMMENT '预算金额(如果是付费)',
  `participant_limit` INT UNSIGNED NOT NULL DEFAULT 1 COMMENT '需要人数',
  `current_participants` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '已确认人数',
  `deadline` DATETIME DEFAULT NULL COMMENT '招募截止时间',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-招募中, 2-已满员, 0-已下架',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_demand_type` (`demand_type`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='协作需求主表';

-- ----------------------------
-- 9. demand_applications (需求应征表)
-- ----------------------------
DROP TABLE IF EXISTS `demand_applications`;
CREATE TABLE `demand_applications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `demand_id` BIGINT UNSIGNED NOT NULL COMMENT '关联的需求ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '应征者ID',
  `apply_message` VARCHAR(512) DEFAULT NULL COMMENT '应征留言',
  `application_status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0-待确认, 1-已录用, 2-已婉拒',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_demand_user` (`demand_id`, `user_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='需求接单/应征记录表';

-- ----------------------------
-- 10. banners (轮播图配置表)
-- ----------------------------
DROP TABLE IF EXISTS `banners`;
CREATE TABLE `banners` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(64) DEFAULT NULL COMMENT '后台管理用的标题',
  `image_url` VARCHAR(512) NOT NULL COMMENT '图片地址',
  `jump_link` VARCHAR(512) DEFAULT NULL COMMENT '点击跳转路径(小程序页面路径或外部链接)',
  `position` VARCHAR(32) NOT NULL DEFAULT 'home_top' COMMENT '展示位置: home_top-首页顶部',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序(越大越靠前)',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-展示, 0-隐藏',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_position_status` (`position`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='轮播图/广告位表';

-- ----------------------------
-- 11. tags (标签字典表)
-- ----------------------------
DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tag_name` VARCHAR(32) NOT NULL COMMENT '标签名称',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tag_name` (`tag_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='全站标签字典表';

-- ----------------------------
-- 12. post_tags (帖子-标签关联表)
-- ----------------------------
DROP TABLE IF EXISTS `post_tags`;
CREATE TABLE `post_tags` (
  `post_id` BIGINT UNSIGNED NOT NULL COMMENT '帖子ID',
  `tag_id` BIGINT UNSIGNED NOT NULL COMMENT '标签ID',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`, `tag_id`),
  KEY `idx_tag_id` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子与标签多对多关联表';

SET FOREIGN_KEY_CHECKS = 1;
