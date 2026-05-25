-- Demand workflow migration for multi-participant collaboration.
-- Run after backup. MySQL 8.0+.

ALTER TABLE `demands`
  MODIFY COLUMN `status` ENUM('OPEN', 'COMPLETED', 'CANCEL_PENDING', 'CANCELLED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
  ADD COLUMN `time_change_requested_by` BIGINT NULL AFTER `status`,
  ADD COLUMN `requested_event_time` DATETIME NULL AFTER `time_change_requested_by`,
  ADD COLUMN `cancel_requested_by` BIGINT NULL AFTER `requested_event_time`,
  ADD COLUMN `cancel_requested_at` DATETIME NULL AFTER `cancel_requested_by`,
  ADD COLUMN `cancelled_at` DATETIME NULL AFTER `cancel_requested_at`;

ALTER TABLE `demand_applications`
  ADD COLUMN `exit_requested_at` DATETIME NULL AFTER `cancelled_at`,
  ADD COLUMN `exit_approved_at` DATETIME NULL AFTER `exit_requested_at`,
  ADD COLUMN `time_change_confirmed_at` DATETIME NULL AFTER `exit_approved_at`,
  ADD COLUMN `demand_cancel_confirmed_at` DATETIME NULL AFTER `time_change_confirmed_at`;

CREATE INDEX `idx_demands_status_event_time` ON `demands` (`status`, `event_time`);
CREATE INDEX `idx_demand_applications_exit_requested` ON `demand_applications` (`demand_id`, `exit_requested_at`);
