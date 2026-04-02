require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔄 正在尝试连接 MySQL 数据库...');
  
  try {
    // 使用连接池可以更好地管理连接
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000 // 10秒超时
    });

    // 获取连接并执行简单查询
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 AS result');
    
    console.log('✅ 连接成功！数据库状态正常。');
    console.log('📊 测试查询结果:', rows[0]);
    
    // 释放连接
    connection.release();
    
    // 关闭连接池，允许脚本正常退出
    await pool.end();
  } catch (error) {
    console.error('❌ 连接失败！请检查网络或环境变量配置。');
    console.error('错误详情:', error.message);
    process.exit(1);
  }
}

testConnection();