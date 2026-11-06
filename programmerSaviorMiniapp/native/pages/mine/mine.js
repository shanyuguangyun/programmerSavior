const config = require('../../utils/config')
const req = require('../../utils/request')

Page({
  data: {
    name: 'admin',
    pushEnabled: false,
    mockMode: true,
    version: '0.1.0'
  },

  onShow() {
    if (!req.ensureLogin()) return
    let pushEnabled = false
    let name = 'admin'
    try {
      pushEnabled = !!wx.getStorageSync('push_enabled')
      name = wx.getStorageSync('admin_name') || 'admin'
    } catch (e) {
      // ignore
    }
    this.setData({
      name: name,
      pushEnabled: pushEnabled,
      mockMode: config.USE_MOCK
    })
  },

  onPushChange(e) {
    const enabled = e.detail.value
    try {
      wx.setStorageSync('push_enabled', enabled)
    } catch (err) {
      // ignore
    }
    this.setData({ pushEnabled: enabled })
    wx.showToast({
      title: enabled ? '已开启新评论提醒' : '已关闭提醒',
      icon: 'none'
    })
  },

  logout() {
    const that = this
    wx.showModal({
      title: '退出登录',
      content: '确定要退出吗？',
      success: function (res) {
        if (!res.confirm) return
        req.clearToken()
        try {
          wx.removeStorageSync('admin_name')
        } catch (e) {
          // ignore
        }
        wx.reLaunch({ url: '/pages/login/login' })
      }
    })
  }
})
