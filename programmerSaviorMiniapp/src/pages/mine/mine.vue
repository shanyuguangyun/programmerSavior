<template>
  <view class="page">
    <!-- 登录状态 -->
    <view class="card user-card">
      <view class="avatar">管</view>
      <view class="user-info">
        <text class="username">管理员</text>
        <text class="sub">已登录（token 已保存到本地）</text>
      </view>
    </view>

    <!-- 设置项 -->
    <view class="card">
      <view class="cell">
        <text class="cell-label">数据来源</text>
        <text class="cell-value">{{ mockTip }}</text>
      </view>
      <view class="cell">
        <text class="cell-label">新评论推送</text>
        <text class="cell-value">规划中（v1 不做实时推送，打开刷新即可）</text>
      </view>
      <view class="cell">
        <text class="cell-label">每日摘要</text>
        <text class="cell-value">规划中</text>
      </view>
    </view>

    <view class="logout" @click="onLogout">退出登录</view>

    <view class="footer">码农自救 · 管理端 v1.0</view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { clearToken, ensureLogin } from '../../api/request'

onShow(() => {
  ensureLogin()
})

const mockTip = ref('Mock 数据（后端接口就绪后自动切换）')

function onLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    success: (res) => {
      if (res.confirm) {
        clearToken()
        uni.reLaunch({ url: '/pages/login/login' })
      }
    }
  })
}
</script>

<style scoped>
.page {
  padding: 24rpx;
}
.card {
  background: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}
.user-card {
  padding: 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
}
.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #3b82f6;
  color: #ffffff;
  font-size: 40rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.username {
  font-size: 32rpx;
  font-weight: 600;
  display: block;
}
.sub {
  font-size: 22rpx;
  color: #9aa0a6;
  margin-top: 6rpx;
  display: block;
}
.cell {
  padding: 28rpx 32rpx;
  border-top: 1rpx solid #f0f1f3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20rpx;
}
.cell:first-child {
  border-top: none;
}
.cell-label {
  font-size: 27rpx;
  flex-shrink: 0;
}
.cell-value {
  font-size: 22rpx;
  color: #9aa0a6;
  text-align: right;
}
.logout {
  background: #ffffff;
  border-radius: 16rpx;
  text-align: center;
  padding: 28rpx 0;
  color: #ef4444;
  font-size: 28rpx;
  font-weight: 600;
}
.footer {
  text-align: center;
  color: #c0c4cc;
  font-size: 22rpx;
  margin-top: 60rpx;
}
</style>
