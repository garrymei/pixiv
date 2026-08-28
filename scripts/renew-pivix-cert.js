#!/usr/bin/env node
/**
 * pivix.top + www.pivix.top 一键 HTTPS 证书续期
 * 用法：
 *   前置：先跑 sudo bash scripts/apply-nginx-webroot.sh 给 80 端口补 /.well-known 路由
 *   1) sudo LE_EMAIL=you@example.com node scripts/renew-pivix-cert.js --staging   # 先跑 staging 测
 *   2) sudo LE_EMAIL=you@example.com node scripts/renew-pivix-cert.js             # 生产签发
 *
 * 会自动：
 *   - 在 /var/lib/acme-webroot/.well-known/acme-challenge/ 放 HTTP-01 挑战文件
 *   - 签发证书
 *   - 覆盖到 /etc/nginx/ssl/pivix.top/{fullchain.pem,privkey.pem}
 *   - 备份老证书到 /etc/nginx/ssl/pivix.top/backup-<timestamp>/
 *   - nginx -s reload
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SCRIPT_CACHE = path.join(PROJECT_ROOT, '.cache', 'acme-client');
if (!fs.existsSync(SCRIPT_CACHE)) {
  fs.mkdirSync(SCRIPT_CACHE, { recursive: true });
  const pkg = JSON.stringify({ name: 'acme-cache-pivix', private: true }, null, 2);
  fs.writeFileSync(path.join(SCRIPT_CACHE, 'package.json'), pkg);
}
if (!fs.existsSync(path.join(SCRIPT_CACHE, 'node_modules', 'acme-client'))) {
  console.log('⬇️  首次运行：安装 acme-client（只安装到 .cache，不污染项目依赖）...');
  try {
    execSync(
      'npm install acme-client@^5.0.0 --no-audit --no-fund --loglevel=error',
      { cwd: SCRIPT_CACHE, stdio: 'inherit' }
    );
  } catch (e) {
    console.error('❌ acme-client 安装失败，请手动到项目根目录执行：');
    console.error('   cd .cache/acme-client && npm i acme-client');
    process.exit(1);
  }
}
const ACME = require(path.join(SCRIPT_CACHE, 'node_modules', 'acme-client'));

const DOMAINS = ['pivix.top', 'www.pivix.top'];
const WEBROOT = '/var/lib/acme-webroot';
const CHALLENGE_DIR = path.join(WEBROOT, '.well-known', 'acme-challenge');
const CERT_DIR = '/etc/nginx/ssl/pivix.top';
const FULLCHAIN_PATH = path.join(CERT_DIR, 'fullchain.pem');
const PRIVKEY_PATH = path.join(CERT_DIR, 'privkey.pem');

const ACCOUNT_KEY_PATH = path.join(os.homedir(), '.acme-pivix', 'account-key.pem');
const CERT_KEY_PATH = path.join(os.homedir(), '.acme-pivix', 'cert-key.pem');

function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}

function run(cmd) {
  console.log(`  $ ${cmd}`);
  return execSync(cmd, { stdio: 'inherit' });
}

async function main() {
  const staging = process.argv.includes('--staging');
  const email = process.env.LE_EMAIL || `admin@${DOMAINS[0]}`;

  console.log(`\n🔐 ${staging ? '[STAGING] ' : ''}签发证书：${DOMAINS.join(', ')}`);
  console.log(`   邮箱：${email}\n`);

  mkdirp(path.dirname(ACCOUNT_KEY_PATH));
  mkdirp(path.dirname(CERT_KEY_PATH));
  mkdirp(CHALLENGE_DIR);
  mkdirp(CERT_DIR);

  // 1) 账号私钥（不存在就生成）
  let accountKey;
  if (fs.existsSync(ACCOUNT_KEY_PATH)) {
    accountKey = fs.readFileSync(ACCOUNT_KEY_PATH).toString();
  } else {
    console.log('① 生成 Let\'s Encrypt 账号私钥 ...');
    accountKey = await ACME.crypto.createPrivateKey();
    fs.writeFileSync(ACCOUNT_KEY_PATH, accountKey, { mode: 0o600 });
  }

  // 2) 证书私钥
  let certKey;
  if (fs.existsSync(CERT_KEY_PATH)) {
    certKey = fs.readFileSync(CERT_KEY_PATH).toString();
  } else {
    console.log('② 生成证书私钥 ...');
    certKey = await ACME.crypto.createPrivateKey();
    fs.writeFileSync(CERT_KEY_PATH, certKey, { mode: 0o600 });
  }

  // 3) ACME 客户端
  const client = new ACME.Client({
    directoryUrl: staging
      ? ACME.directory.letsencrypt.staging
      : ACME.directory.letsencrypt.production,
    accountKey,
    accountUrl: fs.existsSync(ACCOUNT_KEY_PATH + '.url')
      ? fs.readFileSync(ACCOUNT_KEY_PATH + '.url').toString()
      : undefined,
    backoffAttempts: 5
  });

  try {
    const account = await client.createAccount({
      termsOfServiceAgreed: true,
      contact: [`mailto:${email}`]
    });
    const accountUrl = client.getAccountUrl();
    if (accountUrl) fs.writeFileSync(ACCOUNT_KEY_PATH + '.url', accountUrl);
    console.log('③ ACME 账号 OK（', account ? '已有' : '新建', '）');
  } catch (e) {
    console.error('  ❌ 登录/注册 Let\'s Encrypt 账号失败：', e.message);
    process.exit(1);
  }

  // 4) HTTP-01 挑战处理：写入 webroot 文件
  const challengeCreateFn = async (authz, challenge, keyAuthorization) => {
    if (challenge.type !== 'http-01') return;
    const f = path.join(CHALLENGE_DIR, challenge.token);
    fs.writeFileSync(f, keyAuthorization, { mode: 0o644 });
    console.log(`   写挑战文件：${f}`);
  };
  const challengeRemoveFn = async (authz, challenge) => {
    if (challenge.type !== 'http-01') return;
    const f = path.join(CHALLENGE_DIR, challenge.token);
    if (fs.existsSync(f)) fs.unlinkSync(f);
  };

  // 5) CSR + 签发
  console.log('④ 生成 CSR 并发起签发请求 ...');
  const [key, csr] = await ACME.crypto.createCsr({
    commonName: DOMAINS[0],
    altNames: DOMAINS
  }, certKey);

  let cert;
  try {
    cert = await client.auto({
      csr,
      email,
      termsOfServiceAgreed: true,
      challengePriority: ['http-01'],
      challengeCreateFn,
      challengeRemoveFn
    });
  } catch (e) {
    console.error('  ❌ 签发失败：', e.message);
    console.error('  提示：请先执行 sudo scripts/apply-nginx-webroot.sh 给 Nginx 80 端口补上 /.well-known 路由，再执行本脚本。');
    process.exit(1);
  }

  console.log('⑤ 证书签发成功！');
  const notAfter = require('crypto').X509Certificate ? (new (require('crypto').X509Certificate)(cert)).validTo : '未知';
  console.log('   过期时间：', notAfter);

  // 6) 备份老证书并写入新证书
  if (fs.existsSync(FULLCHAIN_PATH) || fs.existsSync(PRIVKEY_PATH)) {
    const backupDir = path.join(CERT_DIR, `backup-${Date.now()}`);
    mkdirp(backupDir);
    if (fs.existsSync(FULLCHAIN_PATH)) run(`cp ${FULLCHAIN_PATH} ${backupDir}/fullchain.pem`);
    if (fs.existsSync(PRIVKEY_PATH)) run(`cp ${PRIVKEY_PATH} ${backupDir}/privkey.pem`);
    console.log(`⑥ 老证书已备份：${backupDir}`);
  } else {
    console.log('⑥ （无老证书可备份）');
  }

  fs.writeFileSync(FULLCHAIN_PATH, cert, { mode: 0o644 });
  fs.writeFileSync(PRIVKEY_PATH, key, { mode: 0o600 });
  console.log('⑦ 新证书已写入：');
  console.log('   ', FULLCHAIN_PATH);
  console.log('   ', PRIVKEY_PATH);

  // 8) 校验 nginx 配置并 reload
  console.log('⑧ nginx -t && nginx -s reload ...');
  run('nginx -t');
  run('nginx -s reload');

  console.log('\n✅ 完成。验证：');
  console.log(`   curl -I https://${DOMAINS[0]}/`);
}

main().catch((e) => {
  console.error('\n❌ 未预期错误：', e);
  process.exit(1);
});
