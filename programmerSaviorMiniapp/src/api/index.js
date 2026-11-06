import { request } from './request'

/**
 * 管理端接口定义（与后端约定好就一一对应）：
 * - POST /auth/token        账号密码换 token
 * - GET  /admin/overview    未读数 + 今日 PV/UV + 7 天趋势 + 最近评论
 * - GET  /admin/comments    评论列表（?unread=true 只看未读）
 * - PUT  /admin/seen        把"已读水位线"推进到现在
 * - GET  /admin/articles    文章列表（含 7 天浏览/评论数）
 */

/** 假数据：后端未就绪期间使用 */
const mock = {
  overview: {
    unreadCount: 3,
    todayPv: 26,
    todayUv: 9,
    trend: [
      { day: '10-30', pv: 12 },
      { day: '10-31', pv: 18 },
      { day: '11-01', pv: 7 },
      { day: '11-02', pv: 31 },
      { day: '11-03', pv: 22 },
      { day: '11-04', pv: 15 },
      { day: '11-05', pv: 26 }
    ],
    latestComments: [
      {
        id: 101,
        author: '路过的后端',
        content: '这篇讲事务传播的文章太及时了，正好解决我线上问题！',
        postTitle: 'Spring 事务传播行为详解',
        createdAt: '2026-11-05 14:32',
        isNew: true
      },
      {
        id: 102,
        author: '匿名',
        content: '请问能出一期 JVM 调优实战吗？',
        postTitle: '从零开始的原理解析系列',
        createdAt: '2026-11-05 11:08',
        isNew: true
      }
    ]
  },
  comments: [
    {
      id: 101,
      author: '路过的后端',
      content: '这篇讲事务传播的文章太及时了，正好解决我线上问题！',
      postTitle: 'Spring 事务传播行为详解',
      createdAt: '2026-11-05 14:32',
      isNew: true
    },
    {
      id: 102,
      author: '匿名',
      content: '请问能出一期 JVM 调优实战吗？',
      postTitle: '从零开始的原理解析系列',
      createdAt: '2026-11-05 11:08',
      isNew: true
    },
    {
      id: 103,
      author: '小王',
      content: '收藏了，回头细看。',
      postTitle: 'MySQL 索引失效的十种场景',
      createdAt: '2026-11-04 20:15',
      isNew: true
    },
    {
      id: 99,
      author: '北漂程序员',
      content: '写得很清楚，已转发给组里新人。',
      postTitle: 'Spring 事务传播行为详解',
      createdAt: '2026-11-03 09:40',
      isNew: false
    },
    {
      id: 97,
      author: '匿名',
      content: '楼主加油！',
      postTitle: 'Redis 缓存穿透与击穿',
      createdAt: '2026-11-02 16:22',
      isNew: false
    }
  ],
  articles: [
    { id: 1, title: 'Spring 事务传播行为详解', views7d: 86, comments: 12, rank: 1 },
    { id: 2, title: 'MySQL 索引失效的十种场景', views7d: 64, comments: 5, rank: 2 },
    { id: 3, title: 'Redis 缓存穿透与击穿', views7d: 41, comments: 3, rank: 3 },
    { id: 4, title: '从零开始的原理解析系列', views7d: 23, comments: 1, rank: 4 },
    { id: 5, title: '记一次线上 OOM 排查', views7d: 9, comments: 0, rank: 5 }
  ]
}

function mockDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), 250))
}

export function login(username, password) {
  if (username === 'admin' && password === '123456') {
    return mockDelay({ token: 'mock-token-' + Date.now() })
  }
  return Promise.reject(new Error('账号或密码错误（Mock 环境：admin / 123456）'))
}

export function getOverview() {
  return mockDelay(mock.overview)
}

export function getComments() {
  return mockDelay(mock.comments)
}

/** 标记已读：Mock 环境直接本地改数据 */
export function markSeen() {
  mock.comments.forEach((c) => (c.isNew = false))
  mock.overview.unreadCount = 0
  mock.overview.latestComments.forEach((c) => (c.isNew = false))
  return mockDelay({ ok: true })
}

export function getArticles() {
  return mockDelay(mock.articles)
}
