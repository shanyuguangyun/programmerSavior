<script>
export default {
  onLaunch() {
    // 登录态检查交给各页面的 onShow（见 api/request.js 的 ensureLogin）。
    // 小程序在 onLaunch 阶段页面栈尚未就绪，此时 reLaunch 会失败。
  }
}
</script>

<style>
page {
  background-color: #f5f6f8;
  color: #1f2937;
  font-size: 28rpx;
}
</style>
