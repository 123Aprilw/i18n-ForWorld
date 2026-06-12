<template>
	<view class="order-list-page">
		<view class="order-header">
			<BrandLogo />
			<LanguageSwitcher />
		</view>
		<view class="order-main">
			<view class="order-section-title">
				<view class="order-section-title__bar" />
				<text class="order-section-title__text">{{ t('order.historyTitle') }}</text>
			</view>
			<scroll-view scroll-x class="order-tabs" :show-scrollbar="false">
				<view class="order-tabs__inner">
					<view
						v-for="tab in tabs"
						:key="tab.key"
						class="order-tabs__item"
						:class="{ active: activeTab === tab.key }"
						@click="activeTab = tab.key"
					>
						<text>{{ t(tab.labelKey) }}</text>
					</view>
				</view>
			</scroll-view>
			<scroll-view scroll-y class="order-body" :show-scrollbar="false">
				<view class="order-body__inner">
				<view v-if="filteredOrders.length === 0" class="empty">
					<text>{{ t('order.title') }}</text>
				</view>
				<view
					v-for="order in filteredOrders"
					:key="order.id"
					class="order-card"
					@click="goDetail(order)"
				>
					<view class="order-card__top">
						<view class="order-card__venue">
							<view class="order-card__venue-icon">
								<image class="order-card__pin" :src="icons.locationPin" mode="aspectFit" />
							</view>
							<text class="order-card__venue-name">{{ t(order.venueKey) }}</text>
						</view>
						<view class="order-card__status" :class="`order-card__status--${order.status}`">
							<text>{{ t(`order.${order.status}`) }}</text>
						</view>
					</view>
					<view class="order-card__meta">
						<view class="order-card__row">
							<image class="order-card__meta-icon" :src="icons.yuyue" mode="aspectFit" />
							<text>{{ t(order.dateKey) }}</text>
						</view>
						<view class="order-card__row">
							<image class="order-card__meta-icon" :src="icons.time" mode="aspectFit" />
							<text>{{ order.time }}</text>
						</view>
					</view>
					<view class="order-card__actions">
						<view class="action-btn" @click.stop="goDetail(order)">
							<text>{{ order.status === 'pending' ? t('order.payNow') : t('order.viewDetail') }}</text>
						</view>
					</view>
				</view>
				</view>
			</scroll-view>
		</view>
		<AppTabBar current="orders" />
		<LanguagePopupHost />
	</view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useLocale } from '@/composables/useLocale'
import { orders, type Order } from '@/utils/mock'
import { icons } from '@/utils/icons'
import BrandLogo from '@/components/BrandLogo.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import AppTabBar from '@/components/AppTabBar.vue'
import LanguagePopupHost from '@/components/LanguagePopupHost.vue'

const { t } = useLocale()
const activeTab = ref('reserved')

onShow(() => {
	const pages = getCurrentPages()
	const page = pages[pages.length - 1] as any
	if (page?.options?.tab) activeTab.value = page.options.tab
})

const tabs = [
	{ key: 'reserved', labelKey: 'order.reserved' },
	{ key: 'pending', labelKey: 'order.pending' },
	{ key: 'paid', labelKey: 'order.paid' },
	{ key: 'arrived', labelKey: 'order.arrived' },
	{ key: 'cancelled', labelKey: 'order.cancelled' }
]

const filteredOrders = computed(() => orders.filter(o => o.status === activeTab.value))

const goDetail = (order: Order) => {
	const typeMap: Record<string, string> = {
		reserved: 'reserved',
		cancelled: 'cancelled',
		pending: 'pendingPayment',
		paid: 'completePayment',
		arrived: 'arrived'
	}
	goDetailType(typeMap[order.status], order)
}

const goDetailType = (type: string, order: Order) => {
	uni.navigateTo({
		url: `/pages/order/detail?type=${type}&orderId=${order.id}&venueKey=${order.venueKey}&dateKey=${order.dateKey}&date=${order.date}&time=${order.time}&seat=${order.seat}&price=${order.price}`
	})
}
</script>

<style lang="scss" scoped>
.order-list-page {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background: #DAE6F3;
	padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
	box-sizing: border-box;
}

.order-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 32rpx;
	padding-top: calc(24rpx + env(safe-area-inset-top));
	background: rgba(255, 255, 255, 0.8);
	border-bottom: 1rpx solid #C2C6D6;
	backdrop-filter: blur(24rpx);
}

.order-main {
	display: flex;
	flex-direction: column;
	flex: 1;
	min-height: 0;
}

.order-section-title {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 32rpx 32rpx 24rpx;
}

.order-section-title__bar {
	width: 4rpx;
	height: 28rpx;
	background: #3B82F6;
	border-radius: 2rpx;
	flex-shrink: 0;
}

.order-section-title__text {
	font-size: 28rpx;
	font-weight: 500;
	color: #333333;
	line-height: 1.4;
}

.order-tabs {
	width: 100%;
	white-space: nowrap;
}

.order-tabs__inner {
	display: inline-flex;
	gap: 16rpx;
	padding: 0 32rpx 24rpx;
}

.order-tabs__item {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 20rpx 48rpx;
	border-radius: 9999rpx;
	background: #FFFFFF;
	border: 1rpx solid #C2C6D6;
	flex-shrink: 0;

	text {
		font-size: 28rpx;
		font-weight: 400;
		color: #424754;
		line-height: 1.4;
		white-space: nowrap;
	}

	&.active {
		background: #0058BE;
		border-color: #0058BE;

		text {
			color: #FFFFFF;
		}
	}
}

.order-body {
	flex: 1;
	min-height: 0;
	height: 0;
	box-sizing: border-box;
}

.order-body__inner {
	padding: 0 32rpx calc(120rpx + env(safe-area-inset-bottom)) 32rpx;
}

.empty {
	text-align: center;
	padding: 80rpx;
	color: #727785;
}

.order-card {
	background: #FFFFFF;
	border: 1rpx solid #C2C6D6;
	border-radius: 24rpx;
	padding: 48rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);

	&:last-child {
		margin-bottom: 0;
	}
}

.order-card__top {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 16rpx;
	margin-bottom: 32rpx;
}

.order-card__venue {
	display: flex;
	align-items: center;
	gap: 24rpx;
	flex: 1;
	min-width: 0;
}

.order-card__venue-icon {
	width: 96rpx;
	height: 96rpx;
	border-radius: 16rpx;
	background: rgba(33, 112, 228, 0.1);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.order-card__pin {
	width: 40rpx;
	height: 40rpx;
}

.order-card__venue-name {
	font-size: 32rpx;
	font-weight: 400;
	color: #0B1C30;
	line-height: 1.5;
}

.order-card__status {
	padding: 8rpx 24rpx;
	background: #D9E7FF;
	border-radius: 9999rpx;
	flex-shrink: 0;

	text {
		font-size: 24rpx;
		color: #3E5980;
		line-height: 1.63;
	}

	&--cancelled {
		background: #EFF0F2;
		text {
			color: #727785;
		}
	}
}

.order-card__meta {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
	margin-bottom: 32rpx;
}

.order-card__row {
	display: flex;
	align-items: center;
	gap: 16rpx;

	text {
		font-size: 32rpx;
		color: #424754;
		line-height: 1.5;
	}
}

.order-card__meta-icon {
	width: 32rpx;
	height: 32rpx;
	flex-shrink: 0;
}

.order-card__actions {
	display: flex;
	justify-content: center;
	padding-top: 16rpx;
}

.action-btn {
	min-width: 298rpx;
	padding: 20rpx 0;
	border: 1rpx solid #C2C6D6;
	border-radius: 16rpx;
	background: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: center;

	text {
		font-size: 28rpx;
		color: #0B1C30;
		line-height: 1.4;
	}
}
</style>
