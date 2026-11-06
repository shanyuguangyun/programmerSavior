App({
  globalData: {
    accountName: ''
  },

  onLaunch() {
    // 启动阶段不做页面跳转：小程序生命周期早期页面栈尚未就绪，
    // 此时 wx.reLaunch 会失败。登录检查下沉到各页面的 onShow。
  }
})
