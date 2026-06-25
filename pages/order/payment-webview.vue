<template>
	<view class="pay-page">
		<PageHeader :title="t('order.payNow')" show-lang background="rgba(248,249,255,0.95)" back-color="#0058BE" />
		<!-- 兜底页面：H5 下正常不应看到此页，用户通过浏览器返回键回来时短暂显示 -->
		<view class="pay-page__loading">
			<view class="pay-page__spinner" />
			<text class="pay-page__hint">{{ t('order.paymentProcessing') }}</text>
		</view>
		<LanguagePopupHost />
	</view>
</template>

<script setup lang="ts">
	import { onLoad, onShow } from '@dcloudio/uni-app'
	import { useLocale } from '@/composables/useLocale'
	import { useLanguagePopup } from '@/composables/useLanguagePopup'
	import PageHeader from '@/components/PageHeader.vue'
	import LanguagePopupHost from '@/components/LanguagePopupHost.vue'

	const { t } = useLocale()
	const { closeLanguagePopup } = useLanguagePopup()

	onShow(() => {
		closeLanguagePopup()
	})

	onLoad((query) => {
		console.log('[payment-webview onLoad] href:', window.location.href)
		console.log('[payment-webview onLoad] query:', JSON.stringify(query))
		console.log('[payment-webview onLoad] ss pay_order_id:', sessionStorage.getItem('pay_order_id'))
		console.log('[payment-webview onLoad] ss pay_payment_no:', sessionStorage.getItem('pay_payment_no'))
		console.log('[payment-webview onLoad] ss pay_payment_url:', sessionStorage.getItem('pay_payment_url')?.slice(0, 60))

		// H5：此页仅作兜底。
		// 正常流程：detail 页直接 window.location.replace 跳 Stripe，不经过此页。
		// 用户用浏览器返回键回来时才会触发此处，直接跳回订单详情。
		const oId = sessionStorage.getItem('pay_order_id') || (query?.order_id as string) || ''

		// 清理 sessionStorage
		sessionStorage.removeItem('pay_payment_url')
		sessionStorage.removeItem('pay_payment_no')
		sessionStorage.removeItem('pay_order_id')

		console.log('[payment-webview onLoad] 跳回 detail，orderId:', oId)

		if (oId) {
			uni.redirectTo({ url: `/pages/order/detail?orderId=${oId}` })
		} else {
			uni.reLaunch({ url: '/pages/order/list' })
		}
	})
</script>

<style lang="scss" scoped>
	.pay-page {
		min-height: 100vh;
		background: #F8F9FF;
	}

	.pay-page__loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 200rpx;
		gap: 32rpx;
	}

	.pay-page__spinner {
		width: 80rpx;
		height: 80rpx;
		border: 6rpx solid #E2E8F0;
		border-top-color: #0058BE;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.pay-page__hint {
		font-size: 28rpx;
		color: #424754;
	}
</style>
