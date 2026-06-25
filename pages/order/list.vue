<template>
	<view class="order-list-page">
		<PageLoading :visible="pageLoading" type="list" />
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
			<PullRefresh 
				class="order-body"
				:class="{ 'order-body--visible': listVisible }"
				:refresh="handleRefresh"
				:loadMore="onScrollToLower"
				:hasMore="hasMore"
				:isLoadingMore="isLoadingMore"
				:showNoMore="filteredOrders.length > 0 && !hasMore"
			>
				<view class="order-body__inner">
				<view v-if="filteredOrders.length === 0 && !loading && !isLoadingMore" class="empty-state">
					<image class="empty-state__logo" src="/static/logo.png" mode="aspectFit" />
					<text class="empty-state__text">{{ t('order.noData') }}</text>
					<text class="empty-state__subtext">{{ t('order.noDataSubtext') }}</text>
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
								<image class="order-card__pin" :src="getImageUrl(icons.locationPin)" mode="aspectFit" />
							</view>
							<text class="order-card__venue-name">{{ order.venueName }}</text>
						</view>
						<view class="order-card__status" :class="`order-card__status--${order.status}`">
							<text>{{ t(`order.${order.status}`) }}</text>
						</view>
					</view>
					<view class="order-card__meta">
						<view class="order-card__row">
							<image class="order-card__meta-icon" :src="getImageUrl(icons.yuyue)" mode="aspectFit" />
							<text>{{ order.date }}</text>
						</view>
						<view class="order-card__row">
							<image class="order-card__meta-icon" :src="getImageUrl(icons.time)" mode="aspectFit" />
							<text>{{ order.time }}</text>
						</view>
					</view>
					<view class="order-card__actions">
						<view class="action-btn" @click.stop="goDetail(order)">
							<text>{{ order.status === 'pending' ? t('order.payNow') : t('order.viewDetail') }}</text>
						</view>
						<view v-if="order.status === 'reserved'" class="action-btn action-btn--danger" @click.stop="handleCancelFromList(order)">
							<text>{{ t('order.cancelOrder') }}</text>
						</view>
					</view>
				</view>
				</view>
			</PullRefresh>
		</view>
		<AppTabBar current="orders" />
		<LanguagePopupHost />

		<!-- 取消预约确认弹窗 -->
		<uv-popup ref="cancelPopupRef" mode="center" round="12" :z-index="10080" :overlay-opacity="0.6"
			:close-on-click-overlay="false">
			<view class="cancel-notice">
				<view class="cancel-notice__body">
					<text class="cancel-notice__title">{{ t('order.cancelOrder') }}</text>
					<text class="cancel-notice__desc">{{ t('order.cancelConfirmDesc') }}</text>
				</view>
				<view class="cancel-notice__actions">
					<view class="cancel-notice__btn cancel-notice__btn--danger" @click="confirmCancelFromList">
						<text>{{ cancelLoading ? t('common.loading') : t('order.confirmCancel') }}</text>
					</view>
					<view class="cancel-notice__btn cancel-notice__btn--ghost" @click="cancelPopupRef?.close()">
						<text>{{ t('common.cancel') }}</text>
					</view>
				</view>
			</view>
		</uv-popup>
	</view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useLocale } from '@/composables/useLocale'
import { useReservationOrder } from '@/composables/useReservationOrder'
import { icons } from '@/utils/icons'
import { getImageUrl } from '@/src/config/env'
import BrandLogo from '@/components/BrandLogo.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import AppTabBar from '@/components/AppTabBar.vue'
import LanguagePopupHost from '@/components/LanguagePopupHost.vue'
import PullRefresh from '@/components/PullRefresh.vue'
import PageLoading from '@/components/PageLoading.vue'

const { t } = useLocale()
const { orders: apiOrders, fetchOrders, loading, hasMore, loadMore, cancelReservation } = useReservationOrder()

const activeTab = ref('all')
const pageLoading = ref(true)
const listVisible = ref(false)
const isLoadingMore = ref(false)

// 状态映射：页面状态 -> API状态
const statusMap: Record<string, string> = {
	'all': '0',          // 全部
	'reserved': '1',      // 已预约
	'arrived': '2',       // 已到场
	'pending': '3',       // 待支付
	'paid': '4',          // 已完成
	'cancelled': '5'     // 已取消
}

onShow(() => {
	const pages = getCurrentPages()
	const page = pages[pages.length - 1] as any
	if (page?.options?.tab) activeTab.value = page.options.tab
	console.log('[DEBUG][OrderList] onShow - activeTab:', activeTab.value, '| statusKey:', statusMap[activeTab.value])
	
	// 检查登录状态，只在已登录时加载数据
	const token = uni.getStorageSync('token')
	if (token) {
		// 每次页面重新显示时刷新当前 tab 数据（如从详情页返回）
		listVisible.value = false
		fetchOrders(statusMap[activeTab.value], 1, true).then(() => {
			console.log('[DEBUG][OrderList] onShow - fetchOrders完成 | apiOrders数量:', apiOrders.value?.length, '| 原始数据:', JSON.stringify(apiOrders.value))
			setTimeout(() => { listVisible.value = true }, 50)
		}).finally(() => {
			pageLoading.value = false
		})
	} else {
		// 未登录时不加载数据，直接显示空状态
		console.log('[DEBUG][OrderList] 未登录，不加载数据')
		pageLoading.value = false
		setTimeout(() => { listVisible.value = true }, 50)
	}
})

// 监听tab变化，获取对应状态的订单
watch(activeTab, (newTab) => {
	console.log('[DEBUG][OrderList] tab切换 ->', newTab, '| statusKey:', statusMap[newTab])
	// 只在已登录时加载数据
	const token = uni.getStorageSync('token')
	if (token) {
		listVisible.value = false
		fetchOrders(statusMap[newTab], 1, true).then(() => {
			console.log('[DEBUG][OrderList] tab切换后fetchOrders完成 | apiOrders数量:', apiOrders.value?.length)
			setTimeout(() => { listVisible.value = true }, 50)
		})
	} else {
		// 未登录时不加载数据
		console.log('[DEBUG][OrderList] 未登录，tab切换不加载数据')
	}
})

// 滚动到底部加载更多
const onScrollToLower = async () => {
	if (isLoadingMore.value || !hasMore.value) return
	isLoadingMore.value = true
	try {
		await loadMore(statusMap[activeTab.value])
	} finally {
		isLoadingMore.value = false
	}
}

// 下拉刷新
const handleRefresh = async () => {
	console.log('[DEBUG][OrderList] handleRefresh - 下拉刷新 | activeTab:', activeTab.value)
	await fetchOrders(statusMap[activeTab.value], 1, true)
	console.log('[DEBUG][OrderList] handleRefresh完成 | apiOrders数量:', apiOrders.value?.length)
}

onMounted(() => {
	// 初始加载由 onShow 统一处理，此处仅保留占位
})

const tabs = [
	{ key: 'all', labelKey: 'order.all' },
	{ key: 'reserved', labelKey: 'order.reserved' },
	{ key: 'arrived', labelKey: 'order.arrived' },
	{ key: 'pending', labelKey: 'order.pending' },
	{ key: 'paid', labelKey: 'order.paid' },
	{ key: 'cancelled', labelKey: 'order.cancelled' }
]

// 使用API数据
const displayOrders = computed(() => {
	console.log('[DEBUG][OrderList] displayOrders computed | apiOrders数量:', apiOrders.value?.length, '| loading:', loading.value)
	if (apiOrders.value && apiOrders.value.length > 0) {
		const mapped = apiOrders.value.map(order => {
			// iOS Safari 不支持 "2024-01-15" 格式，需转为 "2024/01/15"
			const rawDate = order.reserve_date || ''
			const safeDate = rawDate.replace(/-/g, '/')

			return {
				id: order.id.toString(),
				venueName: order.venue_name || '',
				venueCover: order.venue_cover || '',
				status: Object.keys(statusMap).find(key => statusMap[key] === order.status.toString()) || 'reserved',
				date: safeDate,
				time: `${order.start_time} - ${order.end_time}`,
				seat: order.actual_minutes ? `${order.actual_minutes}min` : '',
				price: `¥${order.amount ?? 0}`
			}
		})
		console.log('[DEBUG][OrderList] displayOrders映射结果:', JSON.stringify(mapped))
		return mapped
	}
	console.log('[DEBUG][OrderList] displayOrders - 无数据，返回空数组')
	return []
})

const filteredOrders = computed(() => displayOrders.value)

const goDetail = (order: any) => {
	console.log('[DEBUG][OrderList] goDetail - 点击订单:', order.id, '| status:', order.status, '| venueName:', order.venueName)
	const typeMap: Record<string, string> = {
		reserved: 'reserved',
		cancelled: 'cancelled',
		pending: 'pendingPayment',
		paid: 'completePayment',
		arrived: 'arrived'
	}
	goDetailType(typeMap[order.status], order)
}

const goDetailType = (type: string, order: any) => {
	uni.navigateTo({
		url: `/pages/order/detail?orderId=${order.id}`
	})
}

const cancelPopupRef = ref<{ open: () => void; close: () => void } | null>(null)
const cancelLoading = ref(false)
const pendingCancelOrder = ref<any>(null)

const handleCancelFromList = (order: any) => {
	pendingCancelOrder.value = order
	cancelPopupRef.value?.open()
}

const confirmCancelFromList = async () => {
	if (cancelLoading.value || !pendingCancelOrder.value) return
	cancelLoading.value = true
	try {
		const response = await cancelReservation(pendingCancelOrder.value.id) as any
		cancelPopupRef.value?.close()
		if (response && response.code === 1) {
			uni.showToast({ title: t('order.cancelSuccess'), icon: 'success' })
			await fetchOrders(statusMap[activeTab.value], 1, true)
		} else {
			uni.showToast({ title: response?.msg || t('common.requestFailed'), icon: 'none' })
		}
	} catch (e) {
		uni.showToast({ title: t('common.requestFailed'), icon: 'none' })
	} finally {
		cancelLoading.value = false
		pendingCancelOrder.value = null
	}
}
</script>

<style lang="scss" scoped>
.order-list-page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	max-height: 100vh;
	background: #DAE6F3;
	overflow: hidden;
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
	overflow: hidden;
	padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
	box-sizing: border-box;
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
	transition: background 0.25s ease, border-color 0.25s ease, transform 0.2s ease;

	text {
		font-size: 28rpx;
		font-weight: 400;
		color: #424754;
		line-height: 1.4;
		white-space: nowrap;
		transition: color 0.25s ease;
	}

	&:active {
		transform: scale(0.94);
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
	overflow: hidden;
	opacity: 0;
	transform: translateY(24rpx);
	transition: opacity 0.3s ease, transform 0.3s ease;

	&--visible {
		opacity: 1;
		transform: translateY(0);
	}
}

.order-body__inner {
	padding: 0 32rpx calc(120rpx + env(safe-area-inset-bottom)) 32rpx;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 32rpx;
}

.empty-state__logo {
	width: 200rpx;
	height: 200rpx;
	margin-bottom: 32rpx;
	opacity: 0.6;
}

.empty-state__text {
	font-size: 32rpx;
	font-weight: 500;
	color: #0B1C30;
	line-height: 1.4;
	margin-bottom: 16rpx;
}

.empty-state__subtext {
	font-size: 28rpx;
	color: #727785;
	line-height: 1.4;
}

.load-more {
	padding: 32rpx;
	text-align: center;

	text {
		font-size: 28rpx;
		color: #727785;
		line-height: 1.4;
	}
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
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 12rpx 32rpx;
	background: #D9E7FF;
	border-radius: 9999rpx;
	flex-shrink: 0;
	box-sizing: border-box;

	text {
		font-size: 28rpx;
		color: #3E5980;
		line-height: 1.4;
		text-align: center;
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
	gap: 16rpx;
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

	&--danger {
		border-color: #D40000;
		background: #FFF5F5;

		text {
			color: #D40000;
		}
	}
}

.cancel-notice {
	width: 620rpx;
	background: #F8F9FF;
	border-radius: 24rpx;
	overflow: hidden;
	box-shadow: 0 50rpx 100rpx -24rpx rgba(0, 0, 0, 0.25);
}

.cancel-notice__body {
	padding: 48rpx 48rpx 32rpx;
}

.cancel-notice__title {
	display: block;
	font-size: 40rpx;
	font-weight: 500;
	color: #0B1C30;
	margin-bottom: 16rpx;
	line-height: 1.4;
}

.cancel-notice__desc {
	display: block;
	font-size: 28rpx;
	color: #424754;
	line-height: 1.7;
	white-space: pre-wrap;
}

.cancel-notice__actions {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
	padding: 16rpx 48rpx 48rpx;
}

.cancel-notice__btn {
	height: 88rpx;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;

	text {
		font-size: 28rpx;
		font-weight: 500;
	}

	&--danger {
		background: #D40000;

		text {
			color: #fff;
		}
	}

	&--ghost {
		background: transparent;
		border: 1rpx solid #C2C6D6;

		text {
			color: #424754;
		}
	}
}
</style>
