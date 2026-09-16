require('dotenv').config()
const mysql = require('mysql2/promise')

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })

  try {
    const [columnRows] = await connection.query('SHOW COLUMNS FROM venue_bookings')
    const columns = new Map(columnRows.map((item) => [item.Field, item]))

    if (columns.get('user_id')?.Null !== 'YES') {
      await connection.query('ALTER TABLE venue_bookings MODIFY COLUMN user_id INT NULL')
      console.log('updated: venue_bookings.user_id is nullable')
    }

    const additions = [
      ['booking_type', "ADD COLUMN booking_type VARCHAR(16) NOT NULL DEFAULT 'USER' AFTER user_id"],
      ['customer_name', 'ADD COLUMN customer_name VARCHAR(64) NULL AFTER booking_type'],
      ['customer_phone', 'ADD COLUMN customer_phone VARCHAR(32) NULL AFTER customer_name'],
      ['created_by_admin', 'ADD COLUMN created_by_admin TINYINT NOT NULL DEFAULT 0 AFTER customer_phone']
    ]

    for (const [name, sql] of additions) {
      if (columns.has(name)) continue
      await connection.query(`ALTER TABLE venue_bookings ${sql}`)
      console.log(`added: venue_bookings.${name}`)
    }

    const [indexRows] = await connection.query('SHOW INDEX FROM venue_bookings')
    if (!indexRows.some((item) => item.Key_name === 'idx_venue_bookings_month')) {
      await connection.query(
        'ALTER TABLE venue_bookings ADD KEY idx_venue_bookings_month (status, start_time, scene_id)'
      )
      console.log('added: idx_venue_bookings_month')
    }

    console.log('venue booking admin migration complete')
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
