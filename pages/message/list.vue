<template>
	<view class="message-page">
		<view class="message-header">
			<BrandLogo />
			<LanguageSwitcher />
		</view>
		<scroll-view scroll-y class="message-body">
			<view v-for="msg in messages" :key="msg.id" class="message-card" :class="{ unread: !msg.read }"
				@click="handleMessage(msg)">
				<view class="message-card__icon" :class="msg.type">
					<uv-icon :name="iconMap[msg.type]" size="25" color="#fff"></uv-icon>
				</view>
				<view class="message-card__content">
					<view class="message-card__top">
						<text class="message-card__type">{{ t(typeLabel[msg.type]) }}</text>
						<text class="message-card__time">{{ msg.time }}</text>
					</view>
					<text class="message-card__title">{{ t(msg.titleKey) }}</text>
					<text class="message-card__desc">{{ t(msg.contentKey) }}</text>
				</view>
			</view>
		</scroll-view>
		<AppTabBar current="notifications" />
		<LanguagePopupHost />
	</view>
</template>

<script setup lang="ts">
	import { useLocale } from '@/composables/useLocale'
	import { messages, type Message } from '@/utils/mock'
	import { icons } from '@/utils/icons'
	import BrandLogo from '@/components/BrandLogo.vue'
	import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
	import AppTabBar from '@/components/AppTabBar.vue'
	import LanguagePopupHost from '@/components/LanguagePopupHost.vue'

	const { t } = useLocale()

	const iconMap = { notice: 'bell', reservation: 'calendar', payment: icons.shopping }
	const typeLabel : Record<string, string> = {
		notice: 'message.title',
		reservation: 'message.reservationNotice',
		payment: 'message.paymentNotice'
	}

	const handleMessage = (msg : Message) => {
		if (msg.type === 'payment') {
			uni.navigateTo({ url: '/pages/order/detail?type=pendingPayment' })
		} else if (msg.type === 'reservation') {
			uni.navigateTo({ url: '/pages/order/detail?type=reserved' })
		} else {
			uni.reLaunch({ url: '/pages/home/home' })
		}
	}
</script>

<style lang="scss" scoped>
	.message-page {
		min-height: 100vh;
		background: #DAE6F3;
		padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
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

	.message-body {
		height: calc(100vh - 120rpx - 100rpx - env(safe-area-inset-top) - env(safe-area-inset-bottom));
		padding: 32rpx;
		box-sizing: border-box;
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