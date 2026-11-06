<template>
  <view class="page">
    <!-- 未读 / 全部 切换 -->
    <view class="tabs">
      <view class="tab" :class="{ active: tab === 'unread' }" @click="tab = 'unread'">
        未读{{ unreadCount > 0 ? ' ' + unreadCount : '' }}
      </view>
      <view class="tab" :class="{ active: tab === 'all' }" @click="tab = 'all'">全部</view>
      <view class="mark-all" v-if="unreadCount > 0" @click="onMarkAll">全部已读</view>
    </view>

    <!-- 评论列表 -->
    <view class="card" v-for="c in filtered" :key="c.id">
      <view class="head">
        <view class="avatar">{{ c.author.slice(0, 1) }}</view>
        <text class="author">{{ c.author }}</text>
        <text class="new-badge" v-if="c.isNew">NEW</text>
        <text class="time">{{ c.createdAt }}</text>
      </view>
      <text class="content">{{ c.content }}</text>
      <text class="post">来自：{{ c.postTitle }}</text>
      <view class="actions">
        <view class="action action-primary" v-if="c.isNew" @click="onMarkAll">标记已读</view>
        <view class="action" @click="onReply(c)">回复</view>
      </view>
    </view>

    <view class="empty" v-if="filtered.length === 0">没有更多评论了 🎉</view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { getComments, markSeen } from '../../api'
import { ensureLogin } from '../../api/request'

const tab = ref('unread')
const comments = ref([])

const unreadCount = computed(() => comments.value.filter((c) => c.isNew).length)
const filtered = computed(() =>
  tab.value === 'unread' ? comments.value.filter((c) => c.isNew) : comments.value
)

async function load() {
  try {
    comments.value = await getComments()
  } catch (e) {
    uni.showToast({ title: e.message, icon: 'none' })
  }
}

async function onMarkAll() {
  await markSeen()
  comments.value = comments.value.map((c) => ({ ...c, isNew: false }))
  uni.showToast({ title: '已全部标记为已读', icon: 'none' })
}

function onReply(c) {
  // 第一版只做提示；后续接入"管理员回复"接口时在这里补
  uni.showToast({ title: '回复功能规划中', icon: 'none' })
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
.tabs {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 24rpx;
}
.tab {
  padding: 12rpx 32rpx;
  border-radius: 32rpx;
  background: #ffffff;
  font-size: 26rpx;
  color: #6b7280;
}
.tab.active {
  background: #3b82f6;
  color: #ffffff;
  font-weight: 600;
}
.mark-all {
  margin-left: auto;
  font-size: 24rpx;
  color: #3b82f6;
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
.avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #e5edff;
  color: #3b82f6;
  font-size: 26rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.author {
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
.time {
  margin-left: auto;
  font-size: 22rpx;
  color: #9aa0a6;
}
.content {
  display: block;
  margin: 16rpx 0 10rpx;
  font-size: 27rpx;
  color: #374151;
  line-height: 1.5;
}
.post {
  display: block;
  font-size: 22rpx;
  color: #9aa0a6;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 20rpx;
}
.action {
  padding: 10rpx 28rpx;
  border-radius: 28rpx;
  border: 1rpx solid #d1d5db;
  font-size: 24rpx;
  color: #6b7280;
}
.action-primary {
  border-color: #3b82f6;
  color: #3b82f6;
}
.empty {
  text-align: center;
  color: #9aa0a6;
  padding: 80rpx 0;
  font-size: 26rpx;
}
</style>
