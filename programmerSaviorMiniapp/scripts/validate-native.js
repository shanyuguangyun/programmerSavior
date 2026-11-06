/**
 * 原生小程序离线自检：
 * 1. 所有 .js 语法检查（node --check）
 * 2. 所有 .json 可解析
 * 3. 用最小 wx / Page shim 跑一遍页面逻辑，确认数据能加载出来
 */
const fs = require('fs')
const path = require('path')
const vm = require('vm')
const { execFileSync } = require('child_process')

const root = path.join(__dirname, '..', 'native')
const errors = []

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

const files = walk(root, [])

// 1. JS 语法
const jsFiles = files.filter((f) => f.endsWith('.js'))
for (const f of jsFiles) {
  try {
    execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' })
  } catch (e) {
    errors.push('语法错误 ' + path.relative(root, f) + ': ' + String(e.stderr || e.message).split('\n').slice(0, 3).join(' '))
  }
}

// 2. JSON
const jsonFiles = files.filter((f) => f.endsWith('.json'))
for (const f of jsonFiles) {
  try {
    JSON.parse(fs.readFileSync(f, 'utf8'))
  } catch (e) {
    errors.push('JSON 错误 ' + path.relative(root, f) + ': ' + e.message)
  }
}

// 3. 页面逻辑冒烟
const storage = {}
let captured = null

global.wx = {
  getStorageSync: (k) => (k in storage ? storage[k] : ''),
  setStorageSync: (k, v) => { storage[k] = v },
  removeStorageSync: (k) => { delete storage[k] },
  showToast: () => {},
  switchTab: () => {},
  reLaunch: () => {},
  navigateTo: () => {},
  stopPullDownRefresh: () => {},
  showModal: () => {},
  request: () => {}
}
global.Page = (cfg) => { captured = cfg }
global.App = () => {}
global.getApp = () => ({ globalData: {} })

function loadPage(rel) {
  captured = null
  const full = path.join(root, rel)
  delete require.cache[require.resolve(full)]
  require(full)
  return captured
}

function tick(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

;(async () => {
  // 登录态：直接塞 token，避免被守卫踢走
  storage['admin_token'] = 'test-token'
  storage['admin_name'] = 'admin'

  const overview = loadPage('pages/overview/overview.js')
  overview.setData = function (patch) { Object.assign(this.data, patch) }
  overview.onShow()
  await tick(400)
  if (!overview.data.trend.length) errors.push('overview: trend 为空')
  if (!overview.data.todayPv) errors.push('overview: todayPv 未加载')
  if (overview.data.trend.some((t) => typeof t.h !== 'number')) errors.push('overview: 柱高未计算')

  const comments = loadPage('pages/comments/comments.js')
  comments.setData = function (patch) { Object.assign(this.data, patch) }
  comments.onShow()
  await tick(400)
  if (!comments.data.all.length) errors.push('comments: 列表为空')
  if (!comments.data.filtered.length) errors.push('comments: 未读筛选为空')
  comments.markAll()
  await tick(800)
  if (comments.data.unreadCount !== 0) errors.push('comments: 全部已读后未读不为 0')

  const articles = loadPage('pages/articles/articles.js')
  articles.setData = function (patch) { Object.assign(this.data, patch) }
  articles.onShow()
  await tick(400)
  if (!articles.data.articles.length) errors.push('articles: 列表为空')
  if (articles.data.articles.some((a) => typeof a.width !== 'number')) errors.push('articles: 进度条宽度未计算')
  if (articles.data.articles[0].rank !== 1) errors.push('articles: 排名未按浏览量排序')

  const mine = loadPage('pages/mine/mine.js')
  mine.setData = function (patch) { Object.assign(this.data, patch) }
  mine.onShow()
  if (mine.data.name !== 'admin') errors.push('mine: 账号名未读取')

  const login = loadPage('pages/login/login.js')
  login.setData = function (patch) { Object.assign(this.data, patch) }
  login.onLoad()

  const appJson = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'))
  for (const p of appJson.pages) {
    for (const ext of ['.js', '.json', '.wxml', '.wxss']) {
      const f = path.join(root, p + ext)
      if (!fs.existsSync(f)) errors.push('缺少文件 ' + p + ext)
    }
  }
  if (!appJson.tabBar || appJson.tabBar.list.length !== 4) errors.push('tabBar 配置异常')

  console.log('检查文件数:', files.length)
  if (errors.length) {
    console.log('发现问题:')
    errors.forEach((e) => console.log(' - ' + e))
    process.exit(1)
  }
  console.log('全部通过：语法 / JSON / 四个页面数据加载 / app.json 完整性')
})()
