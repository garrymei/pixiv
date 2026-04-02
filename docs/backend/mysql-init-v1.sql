-- ========================================================
-- 粤次元君 (Yue Ci Yuan Jun) - 数据库初始化脚本 V1
-- ========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. 用户表 (users)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `openid` varchar(100) NOT NULL COMMENT '微信 OpenID',
  `unionid` varchar(100) DEFAULT NULL COMMENT '微信 UnionID',
  `nickname` varchar(50) NOT NULL DEFAULT '微信用户' COMMENT '昵称',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像URL',
  `gender` tinyint NOT NULL DEFAULT '0' COMMENT '0-未知, 1-男, 2-女',
  `bio` varchar(200) DEFAULT NULL COMMENT '个人简介',
  `city` varchar(50) DEFAULT NULL COMMENT '城市',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '1-正常, 0-禁用',
  `is_deleted` tinyint NOT NULL DEFAULT '0' COMMENT '1-已注销/删除',
  `last_login_at` timestamp NULL DEFAULT NULL COMMENT '最后登录时间',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  UNIQUE KEY `uk_unionid` (`unionid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户表';

-- 2. 帖子表 (posts)
DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT '作者ID',
  `post_type` varchar(20) NOT NULL DEFAULT 'work' COMMENT '''work''(作品) / ''daily''(日常)',
  `title` varchar(100) DEFAULT NULL COMMENT '标题 (日常可为空)',
  `content` text NOT NULL COMMENT '正文内容',
  `cover_image` varchar(255) NOT NULL COMMENT '封面图URL',
  `location` varchar(100) DEFAULT NULL COMMENT '拍摄地点',
  `like_count` int unsigned NOT NULL DEFAULT '0' COMMENT '点赞统计',
  `comment_count` int unsigned NOT NULL DEFAULT '0' COMMENT '评论统计',
  `publish_status` tinyint NOT NULL DEFAULT '1' COMMENT '0-草稿, 1-已发布',
  `is_deleted` tinyint NOT NULL DEFAULT '0' COMMENT '1-已删除',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_post_type` (`post_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='帖子表';

-- 3. 帖子图片表 (post_images)
DROP TABLE IF EXISTS `post_images`;
CREATE TABLE `post_images` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `post_id` bigint unsigned NOT NULL COMMENT '关联帖子ID',
  `image_url` varchar(255) NOT NULL COMMENT '图片URL',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序值 (越小越靠前)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_post_id` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='帖子图片表';

-- 4. 评论表 (comments)
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `post_id` bigint unsigned NOT NULL COMMENT '所属帖子ID',
  `user_id` bigint unsigned NOT NULL COMMENT '评论者ID',
  `parent_id` bigint unsigned DEFAULT NULL COMMENT '父级评论ID (楼中楼)',
  `reply_user_id` bigint unsigned DEFAULT NULL COMMENT '被回复者ID',
  `content` text NOT NULL COMMENT '评论内容',
  `is_deleted` tinyint NOT NULL DEFAULT '0' COMMENT '1-已删除',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_post_id` (`post_id`),
  KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='评论表';

-- 5. 点赞表 (likes)
DROP TABLE IF EXISTS `likes`;
CREATE TABLE `likes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT '点赞者ID',
  `target_type` varchar(20) NOT NULL DEFAULT 'post' COMMENT '目标类型: ''post'', ''comment''',
  `target_id` bigint unsigned NOT NULL COMMENT '目标实体ID',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_target` (`user_id`,`target_type`,`target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='点赞表';

-- 6. 活动表 (events)
DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `event_type` varchar(20) NOT NULL DEFAULT 'news' COMMENT '''news''(资讯) / ''activity''(报名活动)',
  `title` varchar(100) NOT NULL COMMENT '标题',
  `cover_image` varchar(255) NOT NULL COMMENT '封面大图',
  `summary` varchar(200) DEFAULT NULL COMMENT '摘要',
  `content` text NOT NULL COMMENT '详细内容(富文本)',
  `city` varchar(50) DEFAULT NULL COMMENT '举办城市',
  `location` varchar(100) DEFAULT NULL COMMENT '具体地点',
  `start_time` datetime NOT NULL COMMENT '开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `registration_deadline` datetime DEFAULT NULL COMMENT '报名截止时间',
  `max_participants` int unsigned DEFAULT NULL COMMENT '最大人数 (NULL表示不限)',
  `current_participants` int unsigned NOT NULL DEFAULT '0' COMMENT '当前已报名人数',
  `publish_status` tinyint NOT NULL DEFAULT '1' COMMENT '0-草稿, 1-已发布',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '1-报名中, 2-进行中, 3-已结束',
  `is_deleted` tinyint NOT NULL DEFAULT '0' COMMENT '1-已删除',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='活动表';

-- 7. 活动报名表 (event_registrations)
DROP TABLE IF EXISTS `event_registrations`;
CREATE TABLE `event_registrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `event_id` bigint unsigned NOT NULL COMMENT '关联活动ID',
  `user_id` bigint unsigned NOT NULL COMMENT '报名用户ID',
  `form_data_json` json DEFAULT NULL COMMENT '动态收集的表单数据(如姓名手机)',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '1-已报名, 0-已取消',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_event_user` (`event_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='活动报名表';

-- 8. 需求表 (demands)
DROP TABLE IF EXISTS `demands`;
CREATE TABLE `demands` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT '发布者ID',
  `demand_type` varchar(20) NOT NULL COMMENT '''photography'', ''model'', ''makeup'' 等',
  `title` varchar(100) NOT NULL COMMENT '标题',
  `description` text NOT NULL COMMENT '详细要求',
  `city` varchar(50) NOT NULL COMMENT '城市',
  `location` varchar(100) DEFAULT NULL COMMENT '具体地点',
  `event_time` datetime DEFAULT NULL COMMENT '期望时间',
  `budget_type` varchar(20) NOT NULL DEFAULT 'free' COMMENT '''free''(互免) / ''paid''(有偿) / ''negotiable''',
  `budget_amount` decimal(10,2) DEFAULT NULL COMMENT '预算金额',
  `participant_limit` int unsigned NOT NULL DEFAULT '1' COMMENT '需要人数',
  `current_participants` int unsigned NOT NULL DEFAULT '0' COMMENT '已确认人数',
  `publish_status` tinyint NOT NULL DEFAULT '1' COMMENT '0-草稿, 1-已发布',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '1-招募中, 2-已满员, 0-已下架',
  `is_deleted` tinyint NOT NULL DEFAULT '0' COMMENT '1-已删除',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='需求表';

-- 9. 需求参与表 (demand_applications)
DROP TABLE IF EXISTS `demand_applications`;
CREATE TABLE `demand_applications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `demand_id` bigint unsigned NOT NULL COMMENT '关联需求ID',
  `user_id` bigint unsigned NOT NULL COMMENT '申请者ID',
  `apply_message` varchar(255) NOT NULL COMMENT '申请留言',
  `status` tinyint NOT NULL DEFAULT '0' COMMENT '0-待审核, 1-已通过, 2-已拒绝, -1-已取消',
  `cancel_reason` varchar(100) DEFAULT NULL COMMENT '拒绝/取消原因',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_demand_user` (`demand_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='需求参与表';

SET FOREIGN_KEY_CHECKS = 1;