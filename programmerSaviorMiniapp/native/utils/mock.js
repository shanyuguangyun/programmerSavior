/**
 * 本地假数据仓库（USE_MOCK 时使用）
 *
 * 用 wx.getStorageSync 持久化，好处是「标记已读」之后
 * 概览页的未读数会跟着变少，行为与真实接口一致。
 */
const STORAGE_KEY = 'ps_mock_state_v1'

function seed() {
  return {
    visitors: { todayPv: 26, todayUv: 9 },
    trend: [
      { day: '10-30', pv: 12 },
      { day: '10-31', pv: 18 },
      { day: '11-01', pv: 7 },
      { day: '11-02', pv: 31 },
      { day: '11-03', pv: 22 },
      { day: '11-04', pv: 15 },
      { day: '11-05', pv: 26 }
    ],
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
      { id: 1, title: 'Spring 事务传播行为详解', views7d: 86, comments: 12 },
      { id: 2, title: 'MySQL 索引失效的十种场景', views7d: 64, comments: 5 },
      { id: 3, title: 'Redis 缓存穿透与击穿', views7d: 41, comments: 3 },
      { id: 4, title: '从零开始的原理解析系列', views7d: 23, comments: 1 },
      { id: 5, title: '记一次线上 OOM 排查', views7d: 9, comments: 0 }
    ]
  }
}

function getState() {
  let state = null
  try {
    state = wx.getStorageSync(STORAGE_KEY)
  } catch (e) {
    state = null
  }
  if (!state || !state.comments) {
    state = seed()
    saveState(state)
  }
  return state
}

function saveState(state) {
  try {
    wx.setStorageSync(STORAGE_KEY, state)
  } catch (e) {
    // 存储失败不影响展示
  }
}

function unreadCount(state) {
  return state.comments.filter(function (c) { return c.isNew }).length
}

function getOverview() {
  const state = getState()
  return {
    unreadCount: unreadCount(state),
    todayPv: state.visitors.todayPv,
    todayUv: state.visitors.todayUv,
    trend: state.trend,
    latestComments: state.comments.slice(0, 2)
  }
}

function getComments() {
  return getState().comments.slice()
}

function getArticles() {
  const list = getState().articles.slice()
  list.sort(function (a, b) { return b.views7d - a.views7d })
  return list.map(function (item, index) {
    return {
      id: item.id,
      title: item.title,
      views7d: item.views7d,
      comments: item.comments,
      rank: index + 1
    }
  })
}

/** 单条标记已读 */
function markOne(id) {
  const state = getState()
  state.comments.forEach(function (c) {
    if (c.id === id) c.isNew = false
  })
  saveState(state)
  return { ok: true }
}

/** 全部标记已读 */
function markAll() {
  const state = getState()
  state.comments.forEach(function (c) { c.isNew = false })
  saveState(state)
  return { ok: true }
}

module.exports = {
  getOverview: getOverview,
  getComments: getComments,
  getArticles: getArticles,
  markOne: markOne,
  markAll: markAll
}
