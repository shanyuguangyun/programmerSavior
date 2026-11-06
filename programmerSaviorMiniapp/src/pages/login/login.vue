<template>
  <view class="page">
    <view class="logo">
      <view class="logo-circle">救</view>
      <text class="title">码农自救 · 管理端</text>
      <text class="sub">文章评论与浏览数据，随手看</text>
    </view>

    <view class="form">
      <input class="input" v-model="username" placeholder="账号" placeholder-class="ph" />
      <input class="input" v-model="password" password placeholder="密码" placeholder-class="ph" />
      <button class="btn" :loading="loading" @click="onLogin">登 录</button>
      <text class="tip" v-if="USE_MOCK">Mock 环境：admin / 123456</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { login } from '../../api'
import { setToken, USE_MOCK } from '../../api/request'

const username = ref('')
const password = ref('')
const loading = ref(false)

async function onLogin() {
  if (!username.value || !password.value) {
    uni.showToast({ title: '请输入账号和密码', icon: 'none' })
    return
  }
  loading.value = true
  try {
    const res = await login(username.value.trim(), password.value)
    setToken(res.token)
    uni.reLaunch({ url: '/pages/overview/overview' })
  } catch (e) {
    uni.showToast({ title: e.message, icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 0 60rpx;
  display: flex;
  flex-direction: column;
}
.logo {
  margin-top: 160rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.logo-circle {
  width: 128rpx;
  height: 128rpx;
  border-radius: 32rpx;
  background: #3b82f6;
  color: #ffffff;
  font-size: 56rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.title {
  margin-top: 32rpx;
  font-size: 36rpx;
  font-weight: 700;
}
.sub {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #9aa0a6;
}
.form {
  margin-top: 100rpx;
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}
.input {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 26rpx 32rpx;
  font-size: 28rpx;
}
.ph {
  color: #c0c4cc;
}
.btn {
  background: #3b82f6;
  color: #ffffff;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 600;
  margin-top: 12rpx;
}
.btn::after {
  border: none;
}
.tip {
  text-align: center;
  font-size: 22rpx;
  color: #9aa0a6;
}
</style>
