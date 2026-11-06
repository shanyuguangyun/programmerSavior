/**
 * 全局配置
 *
 * USE_MOCK = true  -> 用本地假数据（后端没起来也能看界面）
 * USE_MOCK = false -> 走真实后端接口
 *
 * 上线注意：BASE_URL 必须是 HTTPS 域名，且已在小程序后台配置为 request 合法域名；
 * 开发阶段可在开发者工具/调试模式里勾选「不校验合法域名」直连本机。
 */
module.exports = {
  USE_MOCK: true,
  BASE_URL: 'http://localhost:8080/api',
  TOKEN_KEY: 'admin_token'
}
