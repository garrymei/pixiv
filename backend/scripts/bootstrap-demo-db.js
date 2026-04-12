require('dotenv').config()
const mysql = require('mysql2/promise')

const users = [
  {
    id: 1,
    nickname: '粤次元君_官方',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=YueCiYuan',
    bio: '欢迎来到粤次元！这里是二次元同好的聚集地~',
    city: '广州',
    role_type: 'user'
  },
  {
    id: 1002,
    nickname: 'Coser_小樱',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sakura',
    bio: '广州同城 Coser，欢迎约拍扩列。',
    city: '广州',
    role_type: 'user'
  },
  {
    id: 1003,
    nickname: '摄影老法师',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Camera',
    bio: '接寄拍/场照/正片，风格看主页，返图快。',
    city: '广州',
    role_type: 'user'
  },
  {
    id: 1004,
    nickname: '手工大佬',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Craft',
    bio: '手作、道具、教程分享中。',
    city: '深圳',
    role_type: 'user'
  },
  {
    id: 1005,
    nickname: '社团团长',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Team',
    bio: '社团招新，欢迎同好加入。',
    city: '深圳',
    role_type: 'user'
  }
]

const posts = [
  {
    id: 1,
    author_id: 1002,
    title: '周末去拍了原神同人，真的太开心了！感谢摄影师把我都拍瘦了！',
    content: '周末去拍了原神同人，真的太开心了！感谢摄影师把我都拍瘦了！',
    post_type: 'work',
    cover_image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=600',
    location: '广州',
    tags_json: JSON.stringify(['Cosplay', '正片', '原神', '广州场照']),
    created_at: '2024-03-24 18:00:00'
  },
  {
    id: 2,
    author_id: 1003,
    title: '接寄拍/场照/正片，风格看主页，设备A7M4，出片快！',
    content: '接寄拍/场照/正片，风格看主页，设备A7M4，出片快！',
    post_type: 'daily',
    cover_image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
    location: '广州',
    tags_json: JSON.stringify(['摄影接单', '场照', '后期', '日常']),
    created_at: '2024-03-23 23:30:00'
  },
  {
    id: 3,
    author_id: 1002,
    title: '有没有一起出刀剑神域的姐妹！缺个亚丝娜！',
    content: '有没有一起出刀剑神域的姐妹！缺个亚丝娜！',
    post_type: 'daily',
    cover_image: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&q=80&w=600',
    location: '广州',
    tags_json: JSON.stringify(['组队', '刀剑神域', '求组队']),
    created_at: '2024-03-22 17:15:00'
  },
  {
    id: 4,
    author_id: 1004,
    title: '分享一下自制的初音未来道具，轻黏土制作教程~',
    content: '分享一下自制的初音未来道具，轻黏土制作教程~',
    post_type: 'work',
    cover_image: 'https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&q=80&w=600',
    location: '深圳',
    tags_json: JSON.stringify(['道具教程', '初音未来', '手作']),
    created_at: '2024-03-22 02:20:00'
  },
  {
    id: 5,
    author_id: 1,
    title: '粤次元君开站啦，欢迎大家来发作品、找搭子、看活动。',
    content: '粤次元君开站啦，欢迎大家来发作品、找搭子、看活动。',
    post_type: 'daily',
    cover_image: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&q=80&w=600',
    location: '广州',
    tags_json: JSON.stringify(['官方', '公告', '社区']),
    created_at: '2024-03-21 18:00:00'
  }
]

const postImages = [
  { id: 1, post_id: 1, image_url: posts[0].cover_image, sort_order: 0 },
  { id: 2, post_id: 2, image_url: posts[1].cover_image, sort_order: 0 },
  { id: 3, post_id: 3, image_url: posts[2].cover_image, sort_order: 0 },
  { id: 4, post_id: 4, image_url: posts[3].cover_image, sort_order: 0 },
  { id: 5, post_id: 5, image_url: posts[4].cover_image, sort_order: 0 }
]

const comments = [
  { id: 1, post_id: 1, author_id: 1003, content: '这组氛围感绝了！', created_at: '2024-03-24 19:00:00' },
  { id: 2, post_id: 1, author_id: 1, content: '欢迎多发返图，首页给你安排上。', created_at: '2024-03-24 19:30:00' },
  { id: 3, post_id: 5, author_id: 1002, content: '收到，准备来发新正片！', created_at: '2024-03-21 19:00:00' }
]

const likes = [
  { id: 1, post_id: 1, user_id: 1, created_at: '2024-03-24 20:00:00' },
  { id: 2, post_id: 1, user_id: 1003, created_at: '2024-03-24 20:05:00' },
  { id: 3, post_id: 2, user_id: 1002, created_at: '2024-03-23 23:40:00' },
  { id: 4, post_id: 5, user_id: 1002, created_at: '2024-03-21 19:20:00' }
]

const events = [
  {
    id: 1,
    title: '第28届 YACA 动漫展 - 盛夏狂欢季',
    cover_url: 'https://images.unsplash.com/photo-1612487528505-d2338264c821?auto=format&fit=crop&q=80&w=800',
    cover_image: 'https://images.unsplash.com/photo-1612487528505-d2338264c821?auto=format&fit=crop&q=80&w=800',
    start_time: '2026-08-15 09:00:00',
    end_time: '2026-08-17 18:00:00',
    location: '广州保利世贸博览馆',
    description: '年度大型动漫展，含舞台、签售、宅舞与同人摊位。',
    price: 68,
    organizer: 'YACA 组委会',
    status: 'UPCOMING',
    event_type: 'info',
    capacity: 0,
    registration_deadline: null,
    created_at: '2024-03-20 10:00:00'
  },
  {
    id: 2,
    title: '【官方举办】周末二次元同好面基会（包含摄影交流、Coser游园）',
    cover_url: 'https://images.unsplash.com/photo-1541562232579-512a21360020?auto=format&fit=crop&q=80&w=800',
    cover_image: 'https://images.unsplash.com/photo-1541562232579-512a21360020?auto=format&fit=crop&q=80&w=800',
    start_time: '2026-04-20 14:00:00',
    end_time: '2026-04-20 18:00:00',
    location: '广州市天河区动漫星城',
    description: '适合扩列、面基与线下交流的官方活动。',
    price: 0,
    organizer: '粤次元君_官方',
    status: 'UPCOMING',
    event_type: 'official',
    capacity: 50,
    registration_deadline: '2026-04-19 23:59:59',
    created_at: '2024-03-20 11:00:00'
  },
  {
    id: 3,
    title: '初音未来 15周年 纪念全息演唱会 - 广州站',
    cover_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
    cover_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
    start_time: '2025-12-24 19:30:00',
    end_time: '2025-12-24 22:00:00',
    location: '广州体育馆',
    description: '周年纪念演出活动。',
    price: 280,
    organizer: '某演出公司',
    status: 'ENDED',
    event_type: 'info',
    capacity: 0,
    registration_deadline: null,
    created_at: '2024-03-20 12:00:00'
  }
]

const eventRegistrations = [
  { id: 1, event_id: 2, user_id: 1, created_at: '2024-03-21 10:00:00', updated_at: '2024-03-21 10:00:00' },
  { id: 2, event_id: 2, user_id: 1002, created_at: '2024-03-21 10:05:00', updated_at: '2024-03-21 10:05:00' }
]

const demands = [
  {
    id: 1,
    author_id: 1002,
    type: 'PHOTOGRAPHY',
    demand_type: 'PHOTOGRAPHY',
    title: '求一个周末有空的摄影师，拍原神申鹤外景，包车马费和午餐',
    description: '希望熟悉夜景和外景构图，广州可约。',
    time: '2026-04-19 14:00:00',
    event_time: '2026-04-19 14:00:00',
    city: '广州市海珠区',
    location: '广州市海珠区',
    budget_type: 'fixed',
    budget_value: 500,
    budget_amount: 500,
    people_count: 1,
    participant_limit: 1,
    deadline: '2026-04-18 23:59:59',
    status: 'OPEN',
    created_at: '2024-03-24 16:00:00'
  },
  {
    id: 2,
    author_id: 1003,
    type: 'MAKEUP',
    demand_type: 'MAKEUP',
    title: '五一漫展急求妆娘！三个角色连妆，可接单的请私聊，带价来',
    description: '需要妆容稳定、能早起到场。',
    time: '2026-05-01 07:00:00',
    event_time: '2026-05-01 07:00:00',
    city: '广州',
    location: '琶洲保利世贸',
    budget_type: 'negotiable',
    budget_value: null,
    budget_amount: null,
    people_count: 1,
    participant_limit: 1,
    deadline: '2026-04-28 23:59:59',
    status: 'OPEN',
    created_at: '2024-03-23 22:20:00'
  },
  {
    id: 3,
    author_id: 1005,
    type: 'COSER',
    demand_type: 'COSER',
    title: '寻找能出《葬送的芙莉莲》修塔尔克的男Coser，已有芙莉莲和菲伦',
    description: '社团组队外拍，走互勉路线。',
    time: '2026-05-18 15:00:00',
    event_time: '2026-05-18 15:00:00',
    city: '深圳',
    location: '深圳市天河区',
    budget_type: 'free',
    budget_value: null,
    budget_amount: null,
    people_count: 1,
    participant_limit: 1,
    deadline: '2026-05-10 23:59:59',
    status: 'CLOSED',
    created_at: '2024-03-20 18:00:00'
  },
  {
    id: 4,
    author_id: 1,
    type: 'PHOTOGRAPHY',
    demand_type: 'PHOTOGRAPHY',
    title: '官方招募活动跟拍摄影，需会现场抓拍与简单修图',
    description: '官方线下活动需要 1 位跟拍摄影师，活动结束后 24 小时内返图。',
    time: '2026-04-20 13:00:00',
    event_time: '2026-04-20 13:00:00',
    city: '广州',
    location: '动漫星城',
    budget_type: 'fixed',
    budget_value: 800,
    budget_amount: 800,
    people_count: 1,
    participant_limit: 1,
    deadline: '2026-04-18 23:59:59',
    status: 'OPEN',
    created_at: '2024-03-22 12:00:00'
  }
]

const demandApplications = [
  { id: 1, demand_id: 1, user_id: 1003, status: 'APPLIED', created_at: '2024-03-24 17:00:00' },
  { id: 2, demand_id: 4, user_id: 1003, status: 'APPROVED', created_at: '2024-03-22 13:00:00' },
  { id: 3, demand_id: 2, user_id: 1002, status: 'APPLIED', created_at: '2024-03-23 23:00:00' }
]

const banners = [
  {
    id: 1,
    title: '广州 YACA 动漫展 2024',
    image_url: 'https://images.unsplash.com/photo-1612487528505-d2338264c821?auto=format&fit=crop&q=80&w=1000',
    jump_link: '/pages/event-detail/index?id=e_1',
    position: 'home_top',
    sort_order: 10,
    status: 1
  },
  {
    id: 2,
    title: '寻找最美 Coser',
    image_url: 'https://images.unsplash.com/photo-1541562232579-512a21360020?auto=format&fit=crop&q=80&w=1000',
    jump_link: '/pages/discover/index',
    position: 'home_top',
    sort_order: 9,
    status: 1
  }
]

const tags = [
  { id: 1, tag_name: 'Cosplay', status: 1 },
  { id: 2, tag_name: '正片', status: 1 },
  { id: 3, tag_name: '原神', status: 1 },
  { id: 4, tag_name: '摄影接单', status: 1 },
  { id: 5, tag_name: '日常', status: 1 },
  { id: 6, tag_name: '官方', status: 1 }
]

const postTags = [
  { post_id: 1, tag_id: 1 },
  { post_id: 1, tag_id: 2 },
  { post_id: 1, tag_id: 3 },
  { post_id: 2, tag_id: 4 },
  { post_id: 2, tag_id: 5 },
  { post_id: 5, tag_id: 6 }
]

async function execMany(conn, sqlList) {
  for (const sql of sqlList) {
    await conn.query(sql)
  }
}

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  })

  try {
    console.log('开始初始化数据库表和种子数据...')

    await execMany(conn, [
      `CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
        nickname VARCHAR(64) NOT NULL,
        avatar_url VARCHAR(255) NULL,
        bio VARCHAR(255) NULL,
        city VARCHAR(64) NULL,
        role_type VARCHAR(32) NOT NULL DEFAULT 'user',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS posts (
        id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
        author_id BIGINT UNSIGNED NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NULL,
        post_type VARCHAR(16) NOT NULL DEFAULT 'daily',
        cover_image VARCHAR(512) NULL,
        location VARCHAR(128) NULL,
        tags_json JSON NULL,
        like_count INT UNSIGNED NOT NULL DEFAULT 0,
        comment_count INT UNSIGNED NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_posts_author_id (author_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS post_images (
        id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
        post_id BIGINT UNSIGNED NOT NULL,
        image_url VARCHAR(512) NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        KEY idx_post_images_post_id (post_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS comments (
        id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
        post_id BIGINT UNSIGNED NOT NULL,
        author_id BIGINT UNSIGNED NOT NULL,
        content TEXT NOT NULL,
        parent_id BIGINT UNSIGNED NULL,
        reply_user_id BIGINT UNSIGNED NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_comments_post_id (post_id),
        KEY idx_comments_author_id (author_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS likes (
        id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
        post_id BIGINT UNSIGNED NOT NULL,
        user_id BIGINT UNSIGNED NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_likes_post_user (post_id, user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS events (
        id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        cover_url VARCHAR(512) NULL,
        cover_image VARCHAR(512) NULL,
        start_time DATETIME NULL,
        end_time DATETIME NULL,
        location VARCHAR(255) NULL,
        description TEXT NULL,
        price DECIMAL(10,2) NULL,
        organizer VARCHAR(128) NULL,
        status ENUM('UPCOMING','ONGOING','ENDED') NOT NULL DEFAULT 'UPCOMING',
        event_type VARCHAR(16) NOT NULL DEFAULT 'info',
        capacity INT NULL,
        registration_deadline DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS event_registrations (
        id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
        event_id BIGINT UNSIGNED NOT NULL,
        user_id BIGINT UNSIGNED NOT NULL,
        form_data_json JSON NULL,
        registration_status TINYINT NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_event_registrations_event_user (event_id, user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS demands (
        id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
        author_id BIGINT UNSIGNED NOT NULL,
        type ENUM('PHOTOGRAPHY','MAKEUP','COSER','RETOUCH','OTHER') NOT NULL DEFAULT 'OTHER',
        demand_type ENUM('PHOTOGRAPHY','MAKEUP','COSER','RETOUCH','OTHER') NOT NULL DEFAULT 'OTHER',
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        time DATETIME NULL,
        event_time DATETIME NULL,
        city VARCHAR(64) NULL,
        location VARCHAR(128) NULL,
        budget_type VARCHAR(32) NULL,
        budget_value DECIMAL(10,2) NULL,
        budget_amount DECIMAL(10,2) NULL,
        people_count INT NOT NULL DEFAULT 1,
        participant_limit INT NOT NULL DEFAULT 1,
        deadline DATETIME NULL,
        status ENUM('OPEN','CLOSED') NOT NULL DEFAULT 'OPEN',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_demands_author_id (author_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS demand_applications (
        id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
        demand_id BIGINT UNSIGNED NOT NULL,
        user_id BIGINT UNSIGNED NOT NULL,
        status ENUM('APPLIED','APPROVED','REJECTED') NOT NULL DEFAULT 'APPLIED',
        apply_message VARCHAR(512) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_demand_applications_demand_user (demand_id, user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS banners (
        id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
        title VARCHAR(64) NULL,
        image_url VARCHAR(512) NOT NULL,
        jump_link VARCHAR(512) NULL,
        position VARCHAR(32) NOT NULL DEFAULT 'home_top',
        sort_order INT NOT NULL DEFAULT 0,
        status TINYINT NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS tags (
        id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
        tag_name VARCHAR(32) NOT NULL,
        status TINYINT NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_tags_tag_name (tag_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS post_tags (
        post_id BIGINT UNSIGNED NOT NULL,
        tag_id BIGINT UNSIGNED NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (post_id, tag_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    ])

    await conn.beginTransaction()
    await execMany(conn, [
      'DELETE FROM post_tags',
      'DELETE FROM tags',
      'DELETE FROM banners',
      'DELETE FROM demand_applications',
      'DELETE FROM demands',
      'DELETE FROM event_registrations',
      'DELETE FROM events',
      'DELETE FROM likes',
      'DELETE FROM comments',
      'DELETE FROM post_images',
      'DELETE FROM posts',
      'DELETE FROM users'
    ])

    for (const item of users) {
      await conn.query(
        'INSERT INTO users (id, nickname, avatar_url, bio, city, role_type) VALUES (?, ?, ?, ?, ?, ?)',
        [item.id, item.nickname, item.avatar_url, item.bio, item.city, item.role_type]
      )
    }

    for (const item of posts) {
      await conn.query(
        'INSERT INTO posts (id, author_id, title, content, post_type, cover_image, location, tags_json, like_count, comment_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [item.id, item.author_id, item.title, item.content, item.post_type, item.cover_image, item.location, item.tags_json, 0, 0, item.created_at]
      )
    }

    for (const item of postImages) {
      await conn.query(
        'INSERT INTO post_images (id, post_id, image_url, sort_order) VALUES (?, ?, ?, ?)',
        [item.id, item.post_id, item.image_url, item.sort_order]
      )
    }

    for (const item of comments) {
      await conn.query(
        'INSERT INTO comments (id, post_id, author_id, content, created_at) VALUES (?, ?, ?, ?, ?)',
        [item.id, item.post_id, item.author_id, item.content, item.created_at]
      )
    }

    for (const item of likes) {
      await conn.query(
        'INSERT INTO likes (id, post_id, user_id, created_at) VALUES (?, ?, ?, ?)',
        [item.id, item.post_id, item.user_id, item.created_at]
      )
    }

    for (const item of events) {
      await conn.query(
        'INSERT INTO events (id, title, cover_url, cover_image, start_time, end_time, location, description, price, organizer, status, event_type, capacity, registration_deadline, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [item.id, item.title, item.cover_url, item.cover_image, item.start_time, item.end_time, item.location, item.description, item.price, item.organizer, item.status, item.event_type, item.capacity, item.registration_deadline, item.created_at]
      )
    }

    for (const item of eventRegistrations) {
      await conn.query(
        'INSERT INTO event_registrations (id, event_id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [item.id, item.event_id, item.user_id, item.created_at, item.updated_at]
      )
    }

    for (const item of demands) {
      await conn.query(
        'INSERT INTO demands (id, author_id, type, demand_type, title, description, time, event_time, city, location, budget_type, budget_value, budget_amount, people_count, participant_limit, deadline, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [item.id, item.author_id, item.type, item.demand_type, item.title, item.description, item.time, item.event_time, item.city, item.location, item.budget_type, item.budget_value, item.budget_amount, item.people_count, item.participant_limit, item.deadline, item.status, item.created_at]
      )
    }

    for (const item of demandApplications) {
      await conn.query(
        'INSERT INTO demand_applications (id, demand_id, user_id, status, created_at) VALUES (?, ?, ?, ?, ?)',
        [item.id, item.demand_id, item.user_id, item.status, item.created_at]
      )
    }

    for (const item of banners) {
      await conn.query(
        'INSERT INTO banners (id, title, image_url, jump_link, position, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [item.id, item.title, item.image_url, item.jump_link, item.position, item.sort_order, item.status]
      )
    }

    for (const item of tags) {
      await conn.query(
        'INSERT INTO tags (id, tag_name, status) VALUES (?, ?, ?)',
        [item.id, item.tag_name, item.status]
      )
    }

    for (const item of postTags) {
      await conn.query(
        'INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)',
        [item.post_id, item.tag_id]
      )
    }

    await conn.query(
      `UPDATE posts p
       SET like_count = (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id),
           comment_count = (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id)`
    )

    await conn.commit()
    console.log('数据库表和种子数据初始化完成。')
  } catch (error) {
    await conn.rollback()
    console.error('初始化失败:', error.message)
    process.exitCode = 1
  } finally {
    await conn.end()
  }
}

main()
