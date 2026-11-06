const api = require('../../utils/api')
const req = require('../../utils/request')
const config = require('../../utils/config')

Page({
  data: {
    username: '',
    password: '',
    loading: false,
    mockMode: true
  },

  onLoad() {
    this.setData({ mockMode: config.USE_MOCK })
    if (req.isLoggedIn()) {
      wx.reLaunch({ url: '/pages/overview/overview' })
    }
  },

  onUsername(e) {
    this.setData({ username: e.detail.value })
  },

  onPassword(e) {
    this.setData({ password: e.detail.value })
  },

  submit() {
    const username = (this.data.username || '').trim()
    const password = this.data.password || ''

    if (!username || !password) {
      wx.showToast({ title: '请输入账号和密码', icon: 'none' })
      return
    }
    if (this.data.loading) return

    const that = this
    this.setData({ loading: true })

    api.login(username, password).then(function (res) {
      req.setToken((res && res.token) || '')
      try {
        wx.setStorageSync('admin_name', (res && res.name) || username)
      } catch (e) {
        // ignore
      }
      wx.reLaunch({ url: '/pages/overview/overview' })
    }).catch(function (e) {
      wx.showToast({ title: e.message || '登录失败', icon: 'none' })
    }).then(function () {
      that.setData({ loading: false })
    })
  }
})
