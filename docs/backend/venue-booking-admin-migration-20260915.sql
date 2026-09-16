-- Admin 预约日历、代客预约和管理员占用时段
-- 执行库：pivix

ALTER TABLE `venue_bookings`
  MODIFY COLUMN `user_id` INT NULL,
  ADD COLUMN `booking_type` VARCHAR(16) NOT NULL DEFAULT 'USER' AFTER `user_id`,
  ADD COLUMN `customer_name` VARCHAR(64) NULL AFTER `booking_type`,
  ADD COLUMN `customer_phone` VARCHAR(32) NULL AFTER `customer_name`,
  ADD COLUMN `created_by_admin` TINYINT NOT NULL DEFAULT 0 AFTER `customer_phone`,
  ADD KEY `idx_venue_bookings_month` (`status`, `start_time`, `scene_id`);
