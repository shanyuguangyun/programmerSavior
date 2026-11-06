const api = require('../../utils/api')
const req = require('../../utils/request')

const BAR_MAX = 140

Page({
  data: {
    unreadCount: 0,
    todayPv: 0,
    todayUv: 0,
    trend: [],
    latestComments: [],
    loading: true
  },

  onShow() {
    if (!req.ensureLogin()) return
    this.load()
  },

  onPullDownRefresh() {
    const that = this
    this.load().then(function () {
      wx.stopPullDownRefresh()
    }).catch(function () {
      wx.stopPullDownRefresh()
    })
  },

  load() {
    const that = this
    return api.getOverview().then(function (res) {
      let max = 1
      res.trend.forEach(function (t) { if (t.pv > max) max = t.pv })
      const trend = res.trend.map(function (t) {
        return {
          day: t.day,
          pv: t.pv,
          label: t.day.slice(-2),
          h: Math.max(8, Math.round((t.pv / max) * BAR_MAX))
        }
      })
      that.setData({
        unreadCount: res.unreadCount,
        todayPv: res.todayPv,
        todayUv: res.todayUv,
        trend: trend,
        latestComments: res.latestComments,
        loading: false
      })
    }).catch(function (e) {
      that.setData({ loading: false })
      wx.showToast({ title: e.message || '加载失败', icon: 'none' })
    })
  },

  goComments() {
    wx.switchTab({ url: '/pages/comments/comments' })
  }
})
