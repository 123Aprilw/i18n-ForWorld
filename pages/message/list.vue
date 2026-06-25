<template>
	<view class="message-page">
		<PageLoading :visible="pageLoading" type="list" />
		<view class="message-header">
			<BrandLogo />
			<LanguageSwitcher />
		</view>
		<view class="message-main">
			<scroll-view scroll-x class="message-tabs" :show-scrollbar="false">
				<view class="message-tabs__inner">
					<view
						v-for="tab in tabs"
						:key="tab.key"
						class="message-tabs__item"
						:class="{ active: activeType === tab.key }"
						@click="activeType = tab.key"
					>
						<text>{{ t(tab.labelKey) }}</text>
					</view>
				</view>
			</scroll-view>
			<PullRefresh 
				class="message-body"
				:class="{ 'message-body--visible': listVisible }"
				:refresh="handleRefresh"
				:loadMore="handleLoadMore"
				:hasMore="hasMore"
				:isLoadingMore="isLoadingMore"
				:showNoMore="filteredMessages.length > 0 && !hasMore"
			>
				<view class="message-list-inner">
				<view v-if="filteredMessages.length === 0 && !loading && !isLoadingMore" class="empty-state">
					<image class="empty-state__logo" src="/static/logo.png" mode="aspectFit" />
					<text class="empty-state__text">{{ t('message.noData') }}</text>
					<text class="empty-state__subtext">{{ t('message.noDataSubtext') }}</text>
				</view>
				<view v-for="msg in filteredMessages" :key="msg.id" class="message-card" :class="{ unread: !msg.read }"
					@click="handleMessage(msg)">
					<view class="message-card__icon" :class="msg.type">
						<uv-icon :name="iconMap[msg.type]" size="25" color="#fff"></uv-icon>
						<view v-if="!msg.read" class="message-card__badge"></view>
					</view>
					<view class="message-card__content">
						<view class="message-card__top">
							<text class="message-card__type">{{ t(typeLabel[msg.type]) }}</text>
							<text class="message-card__time">{{ msg.time }}</text>
						</view>
						<text class="message-card__title">{{ msg.title }}</text>
						<text class="message-card__desc">{{ msg.content }}</text>
					</view>
				</view>
				</view>
			</PullRefresh>
		</view>
		<AppTabBar current="notifications" />
		<LanguagePopupHost />
	</view>
</template>

<script setup lang="ts">
	import { ref, computed, onMounted, watch } from 'vue'
	import { useLocale } from '@/composables/useLocale'
	import { useNotification } from '@/composables/useNotification'
	import { icons } from '@/utils/icons'
	import BrandLogo from '@/components/BrandLogo.vue'
	import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
	import AppTabBar from '@/components/AppTabBar.vue'
	import LanguagePopupHost from '@/components/LanguagePopupHost.vue'
	import PullRefresh from '@/components/PullRefresh.vue'
	import PageLoading from '@/components/PageLoading.vue'

	const { t } = useLocale()
	const { notifications, fetchNotifications, markAsRead, fetchUnreadCount, loading, hasMore, loadMore } = useNotification()

	const activeType = ref('1') // 1系统/2订单/3预约提醒
	const pageLoading = ref(true)
	const listVisible = ref(true)
	const isLoadingMore = ref(false)

	const tabs = [
		{ key: '1', labelKey: 'message.system' },
		{ key: '2', labelKey: 'message.order' },
		{ key: '3', labelKey: 'message.reservation' }
	]

	// 监听类型变化，重置游标并重新请求
	watch(activeType, (newType) => {
		// 只在已登录时加载数据
		const token = uni.getStorageSync('token')
		if (token) {
			listVisible.value = false
			fetchNotifications(newType, '0', true).then(() => {
				setTimeout(() => { listVisible.value = true }, 50)
			})
		} else {
			// 未登录时不加载数据
			console.log('[DEBUG][MessageList] 未登录，tab切换不加载数据')
		}
	})

	const handleRefresh = async () => {
		// 只在已登录时刷新数据
		const token = uni.getStorageSync('token')
		if (token) {
			await fetchNotifications(activeType.value, '0', true)
			const count = await fetchUnreadCount()
			uni.$emit('unreadCountUpdated', count)
		}
	}

	const handleLoadMore = async () => {
		if (isLoadingMore.value) return
		isLoadingMore.value = true
		try {
			await loadMore(activeType.value)
		} finally {
			isLoadingMore.value = false
		}
	}

	const iconMap = { notice: 'bell', reservation: 'calendar', payment: icons.shopping }
	const typeLabel : Record<string, string> = {
		notice: 'message.system',
		reservation: 'message.reservation',
		payment: 'message.order'
	}

	onMounted(async () => {
		// 检查登录状态，只在已登录时加载数据
		const token = uni.getStorageSync('token')
		if (token) {
			try {
				// 获取未读数量
				const count = await fetchUnreadCount()
				uni.$emit('unreadCountUpdated', count)
				// 获取消息列表（全部，type=0，reset=true）
				await fetchNotifications('1', '0', true)
			} catch (error) {
				console.error('获取消息列表失败:', error)
			}
		} else {
			// 未登录时不加载数据
			console.log('[DEBUG][MessageList] 未登录，不加载数据')
		}
		pageLoading.value = false
		setTimeout(() => { listVisible.value = true }, 50)
	})

	// 将API数据转换为页面需要的格式，不在前端做二次过滤，由接口按 type 返回
	const filteredMessages = computed(() => {
		if (!notifications.value || notifications.value.length === 0) return []
		return notifications.value.map(notification => {
			// API type: 1=系统通知 2=订单通知 3=预约提醒
			let pageType = 'notice'
			if (notification.type === 2) pageType = 'payment'
			if (notification.type === 3) pageType = 'reservation'

			// 根据 related_type 推断订单状态（用于跳转支付还是预约详情）
			// notification 本身不带 order status，通过 title/content 关键词简单判断
			const isPendingPayment = pageType === 'payment' && (
				notification.title?.includes('未払') ||
				notification.title?.includes('支払') ||
				notification.title_en?.toLowerCase().includes('unpaid') ||
				notification.title_en?.toLowerCase().includes('payment due')
			)

			return {
				id: notification.id,
				type: pageType,
				related_type: notification.related_type || '',
				related_id: notification.related_id || 0,
				orderStatus: isPendingPayment ? 'pending' : 'reserved',
				read: notification.is_read === 1,
				time: new Date(notification.createtime * 1000).toLocaleDateString(),
				title: notification.title,
				title_en: notification.title_en || '',
				content: notification.content,
				content_en: notification.content_en || ''
			}
		})
	})

	const handleMessage = async (msg : any) => {
		// 标记为已读
		try {
			await markAsRead(msg.id.toString(), '0')
			const count = await fetchUnreadCount()
			uni.$emit('unreadCountUpdated', count)
		} catch (error) {
			console.error('标记已读失败:', error)
		}

		// 根据 related_type + type 决定跳转目标
		const relatedId = msg.related_id
		const relatedType = msg.related_type

		if (msg.type === 'payment') {
			// 订单类通知：根据 related_type 区分
			if (relatedType === 'reservation_order' && relatedId) {
				// 未支付 → 支付页
				if (msg.orderStatus === 'pending') {
					uni.navigateTo({ url: `/pages/order/detail?type=pendingPayment&orderId=${relatedId}` })
				} else {
					// 其他订单状态 → 订单详情
					uni.navigateTo({ url: `/pages/order/detail?type=reserved&orderId=${relatedId}` })
				}
			} else {
				uni.navigateTo({ url: '/pages/order/list' })
			}
		} else if (msg.type === 'reservation') {
			// 预约提醒：跳转到预约详情
			if (relatedId) {
				uni.navigateTo({ url: `/pages/order/detail?type=reserved&orderId=${relatedId}` })
			} else {
				uni.navigateTo({ url: '/pages/order/list' })
			}
		} else {
			// 系统通知：如果关联的是场馆，跳转场馆详情；否则跳转消息详情页
			if (relatedType === 'venue' && relatedId) {
				uni.navigateTo({ url: `/pages/venue/detail?id=${relatedId}` })
			} else {
				// 将消息数据存入缓存，详情页直接读取
				uni.setStorageSync('currentNotification', {
					id: msg.id,
					title: msg.title,
					title_en: msg.title_en,
					content: msg.content,
					content_en: msg.content_en,
					time: msg.time
				})
				uni.navigateTo({ url: `/pages/message/detail?id=${msg.id}` })
			}
		}
	}
</script>

<style lang="scss" scoped>
	.message-page {
		height: 100vh;
		max-height: 100vh;
		background: #DAE6F3;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.message-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 32rpx;
		padding-top: calc(24rpx + env(safe-area-inset-top));
		background: rgba(255, 255, 255, 0.85);
		border-bottom: 1rpx solid #C2C6D6;
	}

	.message-main {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		overflow: hidden;
		padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.message-tabs {
		width: 100%;
		white-space: nowrap;
		padding: 24rpx 0;
	}

	.message-tabs__inner {
		display: inline-flex;
		gap: 16rpx;
		padding: 0 32rpx;
	}

	.message-tabs__item {
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

	.message-body {
		flex: 1;
		min-height: 0;
		overflow: hidden;
		opacity: 0;
		transform: translateY(24rpx);
		transition: opacity 0.3s ease, transform 0.3s ease;

		&--visible {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.message-list-inner {
		padding: 0 32rpx 32rpx 32rpx;
		box-sizing: border-box;
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

	.message-card {
		display: flex;
		gap: 24rpx;
		background: #fff;
		border: 1rpx solid #C2C6D6;
		border-radius: 24rpx;
		padding: 32rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);

		&.unread {
			border-left: 6rpx solid #0058BE;
		}
	}

	.message-card__icon {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		position: relative;

		&.notice {
			background: #3B82F6;
		}

		&.reservation {
			background: #0058BE;
		}

		&.payment {
			background: rgba(181, 208, 253, 1);
		}
	}

	.message-card__badge {
		position: absolute;
		top: 0;
		right: 0;
		width: 20rpx;
		height: 20rpx;
		border-radius: 50%;
		background: #D40000;
		border: 2rpx solid #fff;
		box-sizing: border-box;
	}

	.message-card__content {
		flex: 1;
		min-width: 0;
	}

	.message-card__top {
		display: flex;
		justify-content: space-between;
		margin-bottom: 8rpx;
	}

	.message-card__type {
		font-size: 24rpx;
		color: #0058BE;
		font-weight: 500;
	}

	.message-card__time {
		font-size: 22rpx;
		color: #727785;
	}

	.message-card__title {
		display: block;
		font-size: 28rpx;
		font-weight: 500;
		color: #0B1C30;
		margin-bottom: 8rpx;
	}

	.message-card__desc {
		display: block;
		font-size: 26rpx;
		color: #424754;
		line-height: 1.5;
		white-space: pre-wrap;
	}
</style>