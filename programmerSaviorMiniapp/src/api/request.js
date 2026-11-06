/**
 * 请求封装：
 * - 自动带上 token（header: X-Admin-Token）
 * - 401 时清除 token 并跳登录页
 * - USE_MOCK = true 时走本地假数据（后端未就绪期间用于预览）
 */

// TODO: 后端 admin 接口联调完成后改为 false
export const USE_MOCK = true

// 小程序真机上要改成你的线上域名（需 HTTPS + ICP 备案）；开发调试阶段用本机 IP
export const BASE_URL = 'http://localhost:8080/api'

const TOKEN_KEY = 'admin_token'

export function getToken() {
  return uni.getStorageSync(TOKEN_KEY) || ''
}

export function setToken(token) {
  uni.setStorageSync(TOKEN_KEY, token)
}

export function clearToken() {
  uni.removeStorageSync(TOKEN_KEY)
}

export function isLoggedIn() {
  return !!getToken()
}

/**
 * 页面级登录守卫。
 * 不在 App.onLaunch 里 reLaunch —— 小程序启动时页面栈尚未就绪，onLaunch 里跳转会失败。
 * 各页面 onShow 时调用：未登录则跳登录页并返回 false。
 */
export function ensureLogin() {
  if (isLoggedIn()) return true
  const url = '/pages/login/login'
  // reLaunch 在部分运行环境（启动早期、某些模拟器）会失败，降级为 navigateTo
  uni.reLaunch({
    url,
    fail: () => uni.navigateTo({ url })
  })
  return false
}

export function request(path, options = {}) {
  const { method = 'GET', data = null } = options

  if (USE_MOCK) {
    // eslint-disable-next-line no-console
    console.log('[MOCK]', method, path, data || '')
    return new Promise((resolve) => {
      setTimeout(() => resolve({ __mock: true, path, method, data }), 300)
    })
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + path,
      method,
      data,
      header: {
        'X-Admin-Token': getToken()
      },
      success: (res) => {
        if (res.statusCode === 401) {
          clearToken()
          uni.reLaunch({ url: '/pages/login/login' })
          reject(new Error('登录已过期'))
          return
        }
        // 后端统一 ApiResponse：{ code, message, data }
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
        } else {
          reject(new Error('请求失败(' + res.statusCode + ')'))
        }
      },
      fail: (err) => reject(new Error(err.errMsg || '网络错误'))
    })
  })
}
