/**
 * 请求与登录态封装
 * - token 存在本地，请求时放在 header: X-Admin-Token
 * - 401 自动清 token 并回登录页
 * - 页面级登录守卫 ensureLogin()：小程序没有 cookie，也避免在 onLaunch 里跳转
 */
const config = require('./config')

function getToken() {
  try {
    return wx.getStorageSync(config.TOKEN_KEY) || ''
  } catch (e) {
    return ''
  }
}

function setToken(token) {
  try {
    wx.setStorageSync(config.TOKEN_KEY, token)
  } catch (e) {
    // ignore
  }
}

function clearToken() {
  try {
    wx.removeStorageSync(config.TOKEN_KEY)
  } catch (e) {
    // ignore
  }
}

function isLoggedIn() {
  return !!getToken()
}

function toLogin() {
  wx.reLaunch({
    url: '/pages/login/login',
    fail: function () {
      wx.navigateTo({ url: '/pages/login/login' })
    }
  })
}

/**
 * 每个 tab 页面 onShow 时调用；未登录返回 false 并跳登录页。
 */
function ensureLogin() {
  if (isLoggedIn()) return true
  toLogin()
  return false
}

function request(path, options) {
  const opts = options || {}
  return new Promise(function (resolve, reject) {
    wx.request({
      url: config.BASE_URL + path,
      method: opts.method || 'GET',
      data: opts.data || null,
      header: {
        'content-type': 'application/json',
        'X-Admin-Token': getToken()
      },
      success: function (res) {
        if (res.statusCode === 401) {
          clearToken()
          toLogin()
          reject(new Error('登录已过期'))
          return
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const body = res.data
          if (body && typeof body === 'object' && 'code' in body) {
            if (body.code === 0 || body.code === 200) {
              resolve(body.data)
            } else {
              reject(new Error(body.message || '请求失败'))
            }
          } else {
            resolve(body)
          }
          return
        }
        reject(new Error('请求失败(' + res.statusCode + ')'))
      },
      fail: function (err) {
        reject(new Error((err && err.errMsg) || '网络错误'))
      }
    })
  })
}

module.exports = {
  getToken: getToken,
  setToken: setToken,
  clearToken: clearToken,
  isLoggedIn: isLoggedIn,
  ensureLogin: ensureLogin,
  toLogin: toLogin,
  request: request
}
