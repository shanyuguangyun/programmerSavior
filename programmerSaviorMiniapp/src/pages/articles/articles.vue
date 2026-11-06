<template>
  <view class="page">
    <view class="card" v-for="a in articles" :key="a.id">
      <view class="head">
        <text class="title">{{ a.title }}</text>
        <text class="rank" :class="'rank-' + a.rank" v-if="a.rank <= 3">{{ a.rank }}</text>
      </view>
      <view class="bar-wrap">
        <view class="bar" :style="{ width: barWidth(a.views7d) + '%' }"></view>
      </view>
      <view class="meta">
        <text>近 7 天 {{ a.views7d }} 次浏览</text>
        <text>{{ a.comments }} 条评论</text>
      </view>
    </view>

    <view class="empty" v-if="articles.length === 0">还没有文章</view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { getArticles } from '../../api'
import { ensureLogin } from '../../api/request'

const articles = ref([])

const maxViews = () => Math.max(...articles.value.map((a) => a.views7d), 1)

function barWidth(views) {
  return Math.max(4, Math.round((views / maxViews()) * 100))
}

async function load() {
  try {
    articles.value = await getArticles()
  } catch (e) {
    uni.showToast({ title: e.message, icon: 'none' })
  }
}

onShow(() => {
  if (ensureLogin()) load()
})

onPullDownRefresh(async () => {
  await load()
  uni.stopPullDownRefresh()
})
</script>

<style scoped>
.page {
  padding: 24rpx;
}
.card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
}
.head {
  display: flex;
  align-items: center;
  gap: 14rpx;
}
.title {
  font-size: 28rpx;
  font-weight: 600;
  flex: 1;
}
.rank {
  width: 40rpx;
  height: 40rpx;
  border-radius: 10rpx;
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}
.rank-1 {
  background: #ef4444;
}
.rank-2 {
  background: #f59e0b;
}
.rank-3 {
  background: #6b7280;
}
.bar-wrap {
  margin: 20rpx 0 14rpx;
  height: 14rpx;
  background: #f0f1f3;
  border-radius: 7rpx;
  overflow: hidden;
}
.bar {
  height: 100%;
  background: linear-gradient(90deg, #60a5fa, #3b82f6);
  border-radius: 7rpx;
}
.meta {
  display: flex;
  justify-content: space-between;
  font-size: 22rpx;
  color: #9aa0a6;
}
.empty {
  text-align: center;
  color: #9aa0a6;
  padding: 80rpx 0;
  font-size: 26rpx;
}
</style>
