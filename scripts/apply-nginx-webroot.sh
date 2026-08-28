#!/usr/bin/env bash
# 给 Nginx 的 80 端口 server（pivix.top / www.pivix.top）加上 ACME webroot 路由，
# 用于 Let's Encrypt HTTP-01 挑战。执行后再运行 renew-pivix-cert.js 即可签发。
# 用法：sudo bash scripts/apply-nginx-webroot.sh

set -euo pipefail

CONF="/etc/nginx/conf.d/pivix.conf"
WEBROOT="/var/lib/acme-webroot"

if [ "$(id -u)" -ne 0 ]; then
  echo "请用 sudo 运行：sudo bash $0" >&2
  exit 1
fi

mkdir -p "${WEBROOT}/.well-known/acme-challenge"
chown -R www-data:www-data "${WEBROOT}"
chmod -R 755 "${WEBROOT}"

if [ -f "$CONF" ]; then
  if grep -q ".well-known/acme-challenge" "$CONF" 2>/dev/null; then
    echo "✅ pivix.conf 里已经有 .well-known 路由，跳过补丁。"
  else
    # 在第一个 server { (80端口) 的 return 301 之前插入 webroot 路由
    python3 - "$CONF" <<'PY'
import sys, re, pathlib
p = pathlib.Path(sys.argv[1])
s = p.read_text()
patch = '''
    location ^~ /.well-known/acme-challenge/ {
        root /var/lib/acme-webroot;
        default_type "text/plain";
        try_files $uri =404;
    }
'''
# 在 listen 80 的 server block 内 return 301 前插入
pattern = r'(server\s*\{[^{]*?listen\s+80[^;]*;.*?)(return\s+301\s+https://\$host\$request_uri;)'
m = re.search(pattern, s, flags=re.S)
if not m:
    print("WARN: 没在 listen 80 的 server 里找到 return 301，尝试在两个 server block 之前都补一段。", file=sys.stderr)
    # fallback: 直接在文件开头追加一个专门的 server
    new_conf = '''server {
    listen 80;
    server_name pivix.top www.pivix.top;

    location ^~ /.well-known/acme-challenge/ {
        root /var/lib/acme-webroot;
        default_type "text/plain";
        try_files $uri =404;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# ===== 原始配置（保留 443 server 段） =====
''' + s
    p.write_text(new_conf)
else:
    s_new = s[:m.start(2)] + patch + "\n    " + s[m.start(2):]
    p.write_text(s_new)
PY

    echo "✅ 已给 $CONF 补上 /.well-known 路由。"
  fi
else
  echo "❌ 找不到 $CONF" >&2
  exit 1
fi

echo ""
echo "📋 测试 webroot 挑战文件能访问到吗："
TOKEN="test-$(date +%s)"
echo -n "ok" > "${WEBROOT}/.well-known/acme-challenge/${TOKEN}"
sleep 1
RESP="$(curl -sS --max-time 5 -H "Host: pivix.top" "http://127.0.0.1/.well-known/acme-challenge/${TOKEN}" 2>&1 || true)"
rm -f "${WEBROOT}/.well-known/acme-challenge/${TOKEN}"
if [ "$RESP" = "ok" ]; then
  echo "   ✅ 挑战路径正常（返回：ok）"
else
  echo "   ❌ 挑战路径异常，返回：$RESP" >&2
  echo "   请检查 /etc/nginx/conf.d/pivix.conf 内容并手动 nginx -s reload" >&2
  exit 1
fi

echo ""
echo "🛠️  校验并 reload Nginx ..."
nginx -t
nginx -s reload

echo ""
echo "✅ Nginx 补丁应用 + reload 成功。下一步："
echo "   sudo node scripts/renew-pivix-cert.js --staging   # 先 dry run"
echo "   sudo node scripts/renew-pivix-cert.js             # 生产签发"
