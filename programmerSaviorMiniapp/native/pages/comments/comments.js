const api = require('../../utils/api')
const req = require('../../utils/request')

Page({
  data: {
    tab: 'unread',
    all: [],
    filtered: [],
    unreadCount: 0
  },

  onShow() {
    if (!req.ensureLogin()) return
    this.load()
  },

  onPullDownRefresh() {
    this.load().then(function () {
      wx.stopPullDownRefresh()
    }).catch(function () {
      wx.stopPullDownRefresh()
    })
  },

  load() {
    const that = this
    return api.getComments().then(function (list) {
      that.setData({
        all: list,
        unreadCount: list.filter(function (c) { return c.isNew }).length
      })
      that.applyFilter(list, that.data.tab)
    }).catch(function (e) {
      wx.showToast({ title: e.message || '加载失败', icon: 'none' })
    })
  },

  applyFilter(list, tab) {
    const filtered = tab === 'unread'
      ? list.filter(function (c) { return c.isNew })
      : list
    this.setData({ filtered: filtered })
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ tab: tab })
    this.applyFilter(this.data.all, tab)
  },

  markOne(e) {
    const that = this
    const id = e.currentTarget.dataset.id
    api.markOne(id).then(function () {
      return that.load()
    })
  },

  markAll() {
    const that = this
    api.markSeen().then(function () {
      return that.load()
    })
  },

  reply() {
    wx.showToast({ title: '回复功能下一步再做', icon: 'none' })
  }
})
