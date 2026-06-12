<template>
	<view class="tabbar">
		<view v-for="item in tabs" :key="item.key" class="tabbar-item" @click="switchTab(item)">
			<image
				class="tabbar-icon"
				:src="current === item.key ? item.iconActive : item.icon"
				mode="aspectFit"
			/>
			<text class="tabbar-label" :class="{ active: current === item.key }">{{ t(item.labelKey) }}</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'

defineProps<{ current: string }>()
const { t } = useLocale()

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
	uni.reLaunch({ url: item.path })
}
</script>

<style lang="scss" scoped>
.tabbar {
	position: fixed;
	left: 0;
	right: 0;
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
}

.tabbar-icon {
	width: 44rpx;
	height: 44rpx;
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
