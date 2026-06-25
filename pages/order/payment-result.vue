<template>
	<view class="result-page">
		<PageHeader :title="t('order.payNow')" background="rgba(248,249,255,0.95)" back-color="#0058BE" />

		<view class="result-page__body">
			<!-- 处理中 -->
			<view v-if="status === 'loading'" class="result-page__state">
				<view class="result-page__spinner" />
				<text class="result-page__title">{{ t('order.paymentProcessing') }}</text>
				<text class="result-page__desc">{{ t('order.paymentWaitDesc') }}</text>
			</view>

			<!-- 支付成功 -->
			<view v-else-if="status === 'success'" class="result-page__state">
				<view class="result-page__icon result-page__icon--success">
					<uv-icon name="checkmark" color="#FFFFFF" size="56" />
				</view>
				<text class="result-page__title">{{ t('order.paymentSuccess') }}</text>
				<view class="result-page__actions">
					<view class="result-page__btn result-page__btn--primary" @click="goDetail">
						<text>{{ t('order.viewDetail') }}</text>
					</view>
				</view>
			</view>

			<!-- 支付失败 -->
			<view v-else-if="status === 'failed'" class="result-page__state">
				<view class="result-page__icon result-page__icon--cancel">
					<uv-icon name="close-circle" color="#FFFFFF" size="56" />
				</view>
				<text class="result-page__title">{{ t('order.paymentFailed') }}</text>
				<text class="result-page__desc">{{ t('order.paymentFailedDesc') }}</text>
				<view class="result-page__actions">
					<view class="result-page__btn result-page__btn--primary" @click="goDetail">
						<text>{{ t('order.viewDetail') }}</text>
					</view>
					<view class="result-page__btn result-page__btn--ghost" @click="goHome">
						<text>{{ t('order.backToHome') }}</text>
					</view>
				</view>
			</view>

			<!-- 超时 -->
			<view v-else-if="status === 'timeout'" class="result-page__state">
				<view class="result-page__icon result-page__icon--cancel">
					<uv-icon name="clock" color="#FFFFFF" size="56" />
				</view>
				<text class="result-page__title">{{ t('order.paymentTimeout') }}</text>
				<text class="result-page__desc">{{ t('order.paymentTimeoutDesc') }}</text>
				<view class="result-page__actions">
					<view class="result-page__btn result-page__btn--ghost" @click="checkAgain">
						<text>{{ t('order.checkPayStatus') }}</text>
					</view>
					<view class="result-page__btn result-page__btn--primary" @click="goOrderList">
						<text>{{ t('order.viewDetail') }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { usePayment } from '@/composables/usePayment'
import PageHeader from '@/components/PageHeader.vue'

const { t } = useLocale()
const { getPaymentStatus } = usePayment()

const status = ref<'loading' | 'success' | 'failed' | 'timeout'>('loading')
const orderId = ref('')
const paymentNo = ref('')

onMounted(async () => {
	console.log('[payment-result] href:', window.location.href)
	console.log('[payment-result] hash:', window.location.hash)

	// H5 HashRouter：参数在 hash 里，如 #/pages/order/payment-result?status=success
	const hashQuery = window.location.hash.includes('?')
		? new URLSearchParams(window.location.hash.split('?')[1])
		: new URLSearchParams()
	const stripeStatus = hashQuery.get('status')

	console.log('[payment-result] stripeStatus:', stripeStatus)

	// 从 sessionStorage 恢复支付信息
	orderId.value = sessionStorage.getItem('pay_order_id') || ''
	paymentNo.value = sessionStorage.getItem('pay_payment_no') || ''

	console.log('[payment-result] pay_order_id:', orderId.value)
	console.log('[payment-result] pay_payment_no:', paymentNo.value)

	// 清除 sessionStorage
	sessionStorage.removeItem('pay_order_id')
	sessionStorage.removeItem('pay_payment_no')
	sessionStorage.removeItem('pay_payment_url')

	// 支付成功：轮询接口确认状态
	if (stripeStatus === 'success' && paymentNo.value) {
		await pollUntilDone()
		return
	}

	// 兜底：无法确认，跳超时
	console.warn('[payment-result] 无法确认支付状态，paymentNo:', paymentNo.value, 'stripeStatus:', stripeStatus)
	status.value = 'timeout'
})

const pollUntilDone = async () => {
	status.value = 'loading'
	const maxAttempts = 10
	let attempts = 0

	const check = async (): Promise<void> => {
		try {
			attempts++
			const result = await getPaymentStatus(paymentNo.value)
			console.log('[payment-result] 轮询结果:', result.payment_status, '第', attempts, '次')
			if (result.payment_status === 1) {
				status.value = 'success'
			} else if (result.payment_status === 2) {
				status.value = 'failed'
			} else if (attempts >= maxAttempts) {
				status.value = 'timeout'
			} else {
				await new Promise(r => setTimeout(r, 2000))
				return check()
			}
		} catch {
			status.value = 'timeout'
		}
	}

	await check()
}

const checkAgain = async () => {
	if (!paymentNo.value) {
		goOrderList()
		return
	}
	await pollUntilDone()
}

const goDetail = () => {
	if (orderId.value) {
		uni.redirectTo({ url: `/pages/order/detail?orderId=${orderId.value}` })
	} else {
		goOrderList()
	}
}

const goOrderList = () => {
	uni.reLaunch({ url: '/pages/order/list' })
}

const goHome = () => {
	uni.reLaunch({ url: '/pages/home/home' })
}
</script>

<style lang="scss" scoped>
.result-page {
	min-height: 100vh;
	background: #F8F9FF;
}

.result-page__body {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: calc(100vh - 88px);
	padding: 48rpx;
}

.result-page__state {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 24rpx;
	width: 100%;
}

.result-page__spinner {
	width: 100rpx;
	height: 100rpx;
	border: 8rpx solid #E2E8F0;
	border-top-color: #0058BE;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
	margin-bottom: 16rpx;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

.result-page__icon {
	width: 160rpx;
	height: 160rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 16rpx;

	&--success { background: #0058BE; }
	&--cancel { background: #EF4444; }
}

.result-page__title {
	font-size: 40rpx;
	font-weight: 600;
	color: #0B1C30;
	text-align: center;
}

.result-page__desc {
	font-size: 28rpx;
	color: #727785;
	text-align: center;
	line-height: 1.6;
}

.result-page__actions {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	margin-top: 16rpx;
}

.result-page__btn {
	height: 88rpx;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;

	text {
		font-size: 30rpx;
		font-weight: 500;
	}

	&--primary {
		background: #0058BE;
		text { color: #fff; }
	}

	&--ghost {
		border: 1rpx solid #0058BE;
		background: transparent;
		text { color: #0058BE; }
	}
}
</style>
