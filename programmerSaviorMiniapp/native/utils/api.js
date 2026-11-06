/**
 * 业务接口层
 *
 * Mock 打开时走 utils/mock.js；关掉后走真实后端：
 *   POST /auth/token        账号密码换 token
 *   GET  /admin/overview    未读数 + 今日 PV/UV + 7 天趋势 + 最近评论
 *   GET  /admin/comments    评论列表（?unread=true 只看未读）
 *   PUT  /admin/seen        把已读水位线推进到现在
 *   GET  /admin/articles    文章列表（含 7 天浏览 / 评论数）
 */
const config = require('./config')
const req = require('./request')
const mock = require('./mock')

function delay(value, ms) {
  return new Promise(function (resolve) {
    setTimeout(function () { resolve(value) }, ms || 250)
  })
}

function login(username, password) {
  if (config.USE_MOCK) {
    if (username === 'admin' && password === '123456') {
      return delay({ token: 'mock-token-' + Date.now(), name: 'admin' })
    }
    return Promise.reject(new Error('账号或密码错误（Mock 环境：admin / 123456）'))
  }
  return req.request('/auth/token', {
    method: 'POST',
    data: { username: username, password: password }
  })
}

function getOverview() {
  if (config.USE_MOCK) return delay(mock.getOverview())
  return req.request('/admin/overview')
}

function getComments(onlyUnread) {
  if (config.USE_MOCK) return delay(mock.getComments())
  return req.request('/admin/comments' + (onlyUnread ? '?unread=true' : ''))
}

function markSeen() {
  if (config.USE_MOCK) return delay(mock.markAll())
  return req.request('/admin/seen', { method: 'PUT' })
}

function markOne(id) {
  if (config.USE_MOCK) return delay(mock.markOne(id))
  // 后端若只提供水位线接口，这里退化为「全部已读」，保持前端可用
  return req.request('/admin/seen', { method: 'PUT' })
}

function getArticles() {
  if (config.USE_MOCK) return delay(mock.getArticles())
  return req.request('/admin/articles')
}

module.exports = {
  login: login,
  getOverview: getOverview,
  getComments: getComments,
  markSeen: markSeen,
  markOne: markOne,
  getArticles: getArticles
}
