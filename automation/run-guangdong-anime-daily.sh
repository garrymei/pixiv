#!/usr/bin/env bash
set -euo pipefail

project_dir=/home/ubuntu/Documents/pixiv
automation_dir="$project_dir/automation"
run_logs_dir="$automation_dir/run-logs"
mkdir -p "$run_logs_dir" "$automation_dir/logs" "$automation_dir/state"

run_stamp=$(date +%Y%m%d-%H%M%S)
log_file="$run_logs_dir/$run_stamp.log"

exec /home/ubuntu/.local/bin/codex exec \
  --ephemeral \
  --approve-for-me \
  --model gpt-5.6-sol \
  --cd "$project_dir" \
  --add-dir /uploads \
  --color never \
  - < "$automation_dir/guangdong-anime-daily.prompt.md" >> "$log_file" 2>&1
