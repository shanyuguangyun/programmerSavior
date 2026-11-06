<template>
  <view class="page">
    <!-- 三个核心数字 -->
    <view class="stats">
      <view class="stat-card" @click="goComments">
        <text class="stat-num" :class="{ 'stat-num-alert': data.unreadCount > 0 }">{{ data.unreadCount }}</text>
        <text class="stat-label">未读评论</text>
      </view>
      <view class="stat-card">
        <text class="stat-num">{{ data.todayPv }}</text>
        <text class="stat-label">今日 PV</text>
      </view>
      <view class="stat-card">
        <text class="stat-num">{{ data.todayUv }}</text>
        <text class="stat-label">今日 UV</text>
      </view>
    </view>

    <!-- 近 7 天浏览趋势 -->
    <view class="card">
      <view class="card-title">近 7 天浏览趋势</view>
      <view class="trend">
        <view class="trend-col" v-for="item in data.trend" :key="item.day">
          <text class="trend-num">{{ item.pv }}</text>
          <view class="trend-bar-wrap">
            <view class="trend-bar" :style="{ height: barHeight(item.pv) + 'rpx' }"></view>
          </view>
          <text class="trend-day">{{ item.day.slice(-2) }}</text>
        </view>
      </view>
    </view>

    <!-- 最新评论 -->
    <view class="card">
      <view class="card-title">
        最新评论
        <text class="card-link" @click="goComments">全部 ›</text>
      </view>
      <view class="comment" v-for="c in data.latestComments" :key="c.id">
        <view class="comment-head">
          <text class="comment-author">{{ c.author }}</text>
          <text class="new-badge" v-if="c.isNew">NEW</text>
          <text class="comment-time">{{ c.createdAt }}</text>
        </view>
        <text class="comment-content">{{ c.content }}</text>
        <text class="comment-post">来自：{{ c.postTitle }}</text>
      </view>
    </view>

    <view class="refresh-tip" @click="load">点击刷新数据</view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getOverview } from '../../api'
import { ensureLogin } from '../../api/request'

const data = ref({
  unreadCount: 0,
  todayPv: 0,
  todayUv: 0,
  trend: [],
  latestComments: []
})

const maxPv = computed(() => Math.max(...data.value.trend.map((t) => t.pv), 1))

function barHeight(pv) {
  return Math.max(8, Math.round((pv / maxPv.value) * 140))
}

async function load() {
  try {
    data.value = await getOverview()
  } catch (e) {
    uni.showToast({ title: e.message, icon: 'none' })
  }
}

function goComments() {
  uni.switchTab({ url: '/pages/comments/comments' })
}

onShow(() => {
  if (ensureLogin()) load()
})
</script>

<style scoped>
.page {
  padding: 24rpx;
}
.stats {
  display: flex;
  gap: 20rpx;
  margin-bottom: 24rpx;
}
.stat-card {
  flex: 1;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 28rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-num {
  font-size: 48rpx;
  font-weight: 700;
  color: #1f2937;
}
.stat-num-alert {
  color: #ef4444;
}
.stat-label {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #9aa0a6;
}
.card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
}
.card-title {
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-link {
  font-size: 24rpx;
  color: #3b82f6;
  font-weight: 400;
}
.trend {
  display: flex;
  align-items: flex-end;
  gap: 12rpx;
}
.trend-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.trend-num {
  font-size: 20rpx;
  color: #6b7280;
  margin-bottom: 6rpx;
}
.trend-bar-wrap {
  height: 140rpx;
  display: flex;
  align-items: flex-end;
  width: 100%;
}
.trend-bar {
  width: 100%;
  background: #3b82f6;
  border-radius: 8rpx 8rpx 4rpx 4rpx;
  opacity: 0.85;
}
.trend-day {
  margin-top: 8rpx;
  font-size: 20rpx;
  color: #9aa0a6;
}
.comment {
  padding: 20rpx 0;
  border-top: 1rpx solid #f0f1f3;
}
.comment:first-of-type {
  border-top: none;
  padding-top: 0;
}
.comment-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.comment-author {
  font-weight: 600;
  font-size: 26rpx;
}
.new-badge {
  background: #ef4444;
  color: #ffffff;
  font-size: 18rpx;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
}
.comment-time {
  margin-left: auto;
  font-size: 22rpx;
  color: #9aa0a6;
}
.comment-content {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #374151;
  line-height: 1.5;
}
.comment-post {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #9aa0a6;
}
.refresh-tip {
  text-align: center;
  color: #3b82f6;
  font-size: 24rpx;
  padding: 16rpx 0 40rpx;
}
</style>
