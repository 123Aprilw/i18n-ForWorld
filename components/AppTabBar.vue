<template>
	<view class="tabbar">
		<view
			v-for="item in tabs"
			:key="item.key"
			class="tabbar-item"
			:class="{ 'tabbar-item--pressed': pressedKey === item.key }"
			@touchstart="pressedKey = item.key"
			@touchend="pressedKey = ''"
			@touchcancel="pressedKey = ''"
			@click="switchTab(item)"
		>
			<view class="tabbar-icon-wrap">
				<image
					class="tabbar-icon"
					:class="{ 'tabbar-icon--active': current === item.key }"
					:src="current === item.key ? item.iconActive : item.icon"
					mode="aspectFit"
				/>
				<view v-if="item.key === 'notifications' && unreadCount > 0" class="tabbar-badge">
					<text class="tabbar-badge-text">{{ unreadCount > 99 ? '99+' : unreadCount }}</text>
				</view>
			</view>
			<text class="tabbar-label" :class="{ active: current === item.key }">{{ t(item.labelKey) }}</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { useNotification } from '@/composables/useNotification'

const props = defineProps<{ current: string }>()
const { t } = useLocale()
const { fetchUnreadCount } = useNotification()

const unreadCount = ref(0)
const pressedKey = ref('')

onMounted(async () => {
	try {
		const count = await fetchUnreadCount()
		unreadCount.value = count || 0
	} catch (error) {
		console.error('获取未读数量失败:', error)
	}
})

// 监听未读数量更新
uni.$on('unreadCountUpdated', (count: number) => {
	unreadCount.value = count
})

const tabs = [
	{
		key: 'home',
		labelKey: 'tab.home',
		path: '/pages/home/home',
		icon: '/static/images/Home.png',
		iconActive: '/static/images/Home_active.png'
	},
	{
		key: 'orders',
		labelKey: 'tab.orders',
		path: '/pages/order/list',
		icon: '/static/images/zhuwen.png',
		iconActive: '/static/images/zhuwen_active.png'
	},
	{
		key: 'notifications',
		labelKey: 'tab.notifications',
		path: '/pages/message/list',
		icon: '/static/images/tongzhi.png',
		iconActive: '/static/images/tongzhi_active.png'
	},
	{
		key: 'profile',
		labelKey: 'tab.profile',
		path: '/pages/profile/index',
		icon: '/static/images/profile.png',
		iconActive: '/static/images/profile_active.png'
	}
]

const switchTab = (item: (typeof tabs)[0]) => {
	if (item.key === props.current) return   // 已在当前 tab，不重复跳转
	uni.reLaunch({ url: item.path })
}
</script>

<style lang="scss" scoped>
.tabbar {
	position: fixed;
	left: var(--app-left, 0);
	right: var(--app-right, 0);
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: space-around;
	height: calc(100rpx + env(safe-area-inset-bottom));
	padding-bottom: env(safe-area-inset-bottom);
	background: rgba(248, 249, 255, 1);
	border-top: 1px solid rgba(194, 198, 214, 1);
	z-index: 100;
}

.tabbar-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4rpx;
	flex: 1;
	padding: 12rpx 0;
	transition: transform 0.12s ease, opacity 0.12s ease;

	/* 按下时轻微缩放反馈 */
	&--pressed {
		transform: scale(0.88);
		opacity: 0.7;
	}
}

.tabbar-icon-wrap {
	position: relative;
	width: 44rpx;
	height: 44rpx;
}

.tabbar-icon {
	width: 44rpx;
	height: 44rpx;
	transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

	/* 激活时弹跳放大 */
	&--active {
		transform: scale(1.18);
	}
}

.tabbar-badge {
	position: absolute;
	top: -4rpx;
	right: -8rpx;
	min-width: 32rpx;
	height: 32rpx;
	padding: 0 8rpx;
	background: #D40000;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2rpx solid #fff;
	box-sizing: border-box;
}

.tabbar-badge-text {
	font-size: 20rpx;
	color: #fff;
	font-weight: 500;
	line-height: 1;
}

.tabbar-label {
	font-size: 20rpx;
	color: #424754;

	&.active {
		color: #3B82F6;
		font-weight: 500;
	}
}
</style>
