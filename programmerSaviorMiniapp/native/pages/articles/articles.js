const api = require('../../utils/api')
const req = require('../../utils/request')

Page({
  data: {
    articles: [],
    totalViews: 0,
    loading: true
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
    return api.getArticles().then(function (list) {
      let max = 1
      let total = 0
      list.forEach(function (a) {
        if (a.views7d > max) max = a.views7d
        total += a.views7d
      })
      const rows = list.map(function (a) {
        return {
          id: a.id,
          title: a.title,
          views7d: a.views7d,
          comments: a.comments,
          rank: a.rank,
          width: Math.max(4, Math.round((a.views7d / max) * 100))
        }
      })
      that.setData({ articles: rows, totalViews: total, loading: false })
    }).catch(function (e) {
      that.setData({ loading: false })
      wx.showToast({ title: e.message || '加载失败', icon: 'none' })
    })
  }
})
