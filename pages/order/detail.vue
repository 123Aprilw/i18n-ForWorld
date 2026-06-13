<template>
	<view class="detail-page" :class="{ 'detail-page--pending': type === 'pendingPayment' }">
		<PageHeader :title="pageTitle" show-lang background="rgba(248, 249, 255, 0.8)" back-color="#0058BE" />
		<scroll-view scroll-y class="detail-body" :show-scrollbar="false">
			<view class="detail-body__inner">
				<!-- 取消状态 -->
				<view v-if="type === 'cancelled'" class="status-header">
					<view class="status-header__icon">
						<uv-icon name="calendar" color="#FFFFFF" size="50" />
					</view>
					<text class="status-header__title">{{ t('order.cancelAutoTitle') }}</text>
					<text class="status-header__desc">{{ t('order.cancelAutoDesc') }}</text>
				</view>

				<!-- 支付完成状态 -->
				<view v-if="type === 'completePayment' || type === 'cashPayment'" class="status-header">
					<view class="status-header__icon">
						<uv-icon name="checkmark" color="#FFFFFF" size="28" />
					</view>
					<text class="status-header__title">
						{{ type === 'cashPayment' ? t('order.cashPaidStatus') : t('order.paidStatus') }}
					</text>
					<text class="status-header__desc">{{ displayDate }}</text>
				</view>

				<!-- 支付金额卡 -->
				<view v-if="type === 'completePayment' || type === 'cashPayment'" class="detail-card amount-card">
					<text class="amount-card__label">{{ t('order.paymentAmount') }}</text>
					<text class="amount-card__value">{{ formattedPrice }}</text>
				</view>

				<!-- 场馆信息 -->
				<view class="detail-card venue-card">
					<image class="venue-card__image" :src="venueImage" mode="aspectFill" />
					<view class="venue-card__body">
						<text class="venue-card__name">{{ t(venueKey) }}</text>
						<view class="venue-card__address">
							<uv-icon name="map" color="#0058BE" size="20" />
							<text>{{ t('order.venueAddress') }}</text>
						</view>
					</view>
				</view>

				<!-- 预约 QR（点击模拟现场核销） -->
				<view v-if="type === 'reserved' || type === 'arrived'" class="detail-card qr-card">
					<text class="qr-card__title">{{ t('order.qrTitle') }}</text>
					<view class="qr-card__code" :class="{ 'qr-card__code--verified': isCheckedIn }"
						@click="simulateCheckIn">
						<uv-qrcode :value="orderId" size="320rpx" :canvas-id="`qr-${orderId}`" />
						<view v-if="isCheckedIn" class="qr-card__verified">
							<uv-icon name="checkmark" color="#FFFFFF" size="20" />
						</view>
					</view>
					<text class="qr-card__hint">{{ qrHintText }}</text>
					<text v-if="!isCheckedIn" class="qr-card__simulate">{{ t('order.tapToScan') }}</text>
				</view>

				<!-- 预约详情 -->
				<view v-if="showReservationDetails" class="detail-card info-card">
					<text class="info-card__title">{{ t('order.reservationDetails') }}</text>
					<view class="info-card__item">
						<text class="info-card__label">{{ t('order.reservationDate') }}</text>
						<view class="info-card__value-row">
							<image class="info-card__icon" :src="getImageUrl(icons.yuyue)" mode="aspectFit" />
							<text>{{ displayDate }}</text>
						</view>
					</view>
					<view class="info-card__item">
						<text class="info-card__label">{{ t('order.reservationTime') }}</text>
						<view class="info-card__value-row">
							<image class="info-card__icon" :src="getImageUrl(icons.time)" mode="aspectFit" />
							<text>{{ time }}</text>
						</view>
					</view>

					<!-- 核销成功后显示入退場时间线 -->
					<view v-if="isCheckedIn" class="schedule-section">
						<view class="schedule-section__divider" />
						<text class="schedule-section__title">{{ t('order.entrySchedule') }}</text>
						<view class="schedule-timeline">
							<view class="schedule-timeline__line" />
							<view class="schedule-item">
								<view class="schedule-item__dot schedule-item__dot--active">
									<view class="schedule-item__dot-inner" />
								</view>
								<view class="schedule-item__content">
									<text
										class="schedule-item__label schedule-item__label--active">{{ t('order.checkIn') }}</text>
									<text class="schedule-item__time">{{ checkInText }}</text>
								</view>
							</view>
							<view class="schedule-item">
								<view class="schedule-item__dot" />
								<view class="schedule-item__content">
									<text class="schedule-item__label">{{ t('order.checkOut') }}</text>
									<text class="schedule-item__time">{{ checkOutText }}</text>
								</view>
							</view>
						</view>
						<view class="schedule-section__btn" @click="goPendingPayment">
							<text>{{ t('order.payNow') }}</text>
						</view>
					</view>
				</view>

				<!-- 料金 -->
				<view v-if="type === 'pendingPayment'" class="detail-card info-card">
					<text class="info-card__title">{{ t('order.feeTitle') }}</text>
					<view class="info-card__item">
						<text class="info-card__label">{{ t('order.entryExitTime') }}</text>
						<view class="info-card__value-row">
							<image class="info-card__icon" :src="icons.time" mode="widthFix" />
							<text>{{ entryExitText }}</text>
						</view>
					</view>
					<view class="info-card__item">
						<text class="info-card__label">{{ t('order.totalAmount') }}</text>
						<view class="info-card__value-row">
							<image class="info-card__icon info-card__icon--payment" :src="icons.payment"
								mode="aspectFit" />
							<text class="info-card__price">{{ formattedPrice }}</text>
						</view>
					</view>
				</view>

				<!-- 支付方式 -->
				<view v-if="type === 'pendingPayment'" class="payment-section">
					<text class="payment-section__title">{{ t('order.selectPaymentMethod') }}</text>
					<view class="payment-option" :class="{ active: payMethod === 'card' }" @click="payMethod = 'card'">
						<view class="payment-option__left">
							<view class="payment-option__icon-wrap payment-option__icon-wrap--card">
								<image class="payment-option__icon" :src="icons.xinyongka" mode="aspectFit" />
							</view>
							<text>{{ t('order.creditCard') }}</text>
						</view>
						<view class="payment-option__radio" :class="{ active: payMethod === 'card' }">
							<uv-icon v-if="payMethod === 'card'" name="checkmark" color="#0058BE" size="12" />
						</view>
					</view>
					<view class="payment-option" :class="{ active: payMethod === 'paypay' }"
						@click="payMethod = 'paypay'">
						<view class="payment-option__left">
							<view class="payment-option__icon-wrap payment-option__icon-wrap--paypay">
								<image class="payment-option__icon" :src="icons.paypay" mode="aspectFit" />
							</view>
							<text>{{ t('order.payPay') }}</text>
						</view>
						<view class="payment-option__radio" :class="{ active: payMethod === 'paypay' }">
							<uv-icon v-if="payMethod === 'paypay'" name="checkmark" color="#0058BE" size="12" />
						</view>
					</view>
				</view>

				<!-- 取消页内嵌按钮 -->
				<view v-if="type === 'cancelled'" class="inline-action">
					<view class="inline-action__btn" @click="handleReReserve">
						<text>{{ t('order.reReserve') }}</text>
					</view>
				</view>

				<!-- 支付完成内嵌按钮 -->
				<view v-if="type === 'completePayment' || type === 'cashPayment'" class="inline-action">
					<view class="inline-action__btn" @click="goHome">
						<text>{{ t('order.backToHome') }}</text>
					</view>
				</view>
			</view>
		</scroll-view>

		<BottomActionBar v-if="type === 'pendingPayment'" :text="t('order.payNow')" @click="handlePay" />
		<LanguagePopupHost />
	</view>
</template>

<script setup lang="ts">
	import { ref, computed, onMounted } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	import { useLocale } from '@/composables/useLocale'
	import { usePayment } from '@/composables/usePayment'
	import { useReservationOrder } from '@/composables/useReservationOrder'
	import { icons } from '@/utils/icons'
	import { getImageUrl } from '@/src/config/env'
	import PageHeader from '@/components/PageHeader.vue'
	import BottomActionBar from '@/components/BottomActionBar.vue'
	import LanguagePopupHost from '@/components/LanguagePopupHost.vue'

	const { t } = useLocale()
	const { createStripePayment, loading: paymentLoading } = usePayment()
	const { getOrderDetail, cancelOrder } = useReservationOrder()

	const type = ref('reserved')
	const orderId = ref('ORD001')
	const venueKey = ref('order.venueKyotoZen')
	const dateKey = ref('order.dateJun21')
	const date = ref('2026-06-21')
	const time = ref('14:00 - 16:00')
	const seat = ref('A-12')
	const price = ref(5000)
	const payMethod = ref<'card' | 'paypay'>('card')
	const checkedIn = ref(false)

	const venueImageMap : Record<string, string> = {
		'order.venueTokyoHub': '/static/images/venues/venue-2.png',
		'order.venueKyotoZen': '/static/images/venues/venue-3.png'
	}

	onLoad((query) => {
		if (query?.type) type.value = query.type as string
		if (query?.orderId) orderId.value = query.orderId as string
		if (query?.venueKey) venueKey.value = query.venueKey as string
		if (query?.dateKey) dateKey.value = query.dateKey as string
		if (query?.date) date.value = query.date as string
		if (query?.time) time.value = query.time as string
		if (query?.seat) seat.value = query.seat as string
		if (query?.price) price.value = Number(query.price)
		if (type.value === 'arrived') checkedIn.value = true
	})

	onMounted(async () => {
		// 如果有订单ID，获取订单详情
		if (orderId.value && orderId.value !== 'ORD001') {
			try {
				const orderDetail = await getOrderDetail(orderId.value)
				if (orderDetail) {
					// 更新页面数据
					date.value = orderDetail.reserve_date
					time.value = `${orderDetail.start_time} - ${orderDetail.end_time}`
					price.value = orderDetail.amount
					// 可以根据需要更新其他字段
				}
			} catch (error) {
				console.error('获取订单详情失败:', error)
			}
		}
	})

	const pageTitle = computed(() => {
		const map : Record<string, string> = {
			reserved: 'order.detail',
			arrived: 'order.arrivedDetail',
			cancelled: 'order.cancelDetail',
			pendingPayment: 'order.pendingPayment',
			completePayment: 'order.completePayment',
			cashPayment: 'order.cashPayment'
		}
		return t(map[type.value] || 'order.detail')
	})

	const venueImage = computed(() => getImageUrl(venueImageMap[venueKey.value] || '/static/images/venues/venue-3.png'))
	const displayDate = computed(() => t(dateKey.value))
	const formattedPrice = computed(() => `${price.value.toLocaleString()}円`)

	const isCheckedIn = computed(() => type.value === 'arrived' || checkedIn.value)

	const qrHintText = computed(() => {
		if (type.value === 'arrived') return t('order.qrExitHint')
		if (isCheckedIn.value) return t('order.qrVerified')
		return t('order.qrHint')
	})

	const showReservationDetails = computed(() =>
		['reserved', 'arrived', 'cancelled', 'pendingPayment', 'completePayment', 'cashPayment'].includes(type.value)
	)

	const timeParts = computed(() => time.value.split(' - ').map(part => part.trim()))
	const checkInText = computed(() => `${displayDate.value} ${timeParts.value[0] || ''}`)
	const checkOutText = computed(() => `${displayDate.value} ${timeParts.value[1] || ''}`)

	const entryExitText = computed(() => {
		const range = time.value.replace(' - ', '-')
		return `${displayDate.value} ${range}`
	})

	const simulateCheckIn = () => {
		if (type.value !== 'reserved' || isCheckedIn.value) return
		checkedIn.value = true
		uni.showToast({ title: t('order.checkInSuccess'), icon: 'success' })
	}

	const goPendingPayment = () => {
		uni.redirectTo({ url: `/pages/order/detail?type=pendingPayment&${detailQuery.value}` })
	}

	const detailQuery = computed(() =>
		`orderId=${orderId.value}&venueKey=${venueKey.value}&dateKey=${dateKey.value}&date=${date.value}&time=${encodeURIComponent(time.value)}&seat=${seat.value}&price=${price.value}`
	)

	const handlePay = async () => {
		if (!orderId.value || orderId.value === 'ORD001') {
			// 如果是模拟订单，直接跳转
			const next = payMethod.value === 'paypay' ? 'cashPayment' : 'completePayment'
			uni.redirectTo({ url: `/pages/order/detail?type=${next}&${detailQuery.value}` })
			return
		}

		try {
			// 调用支付API
			const paymentMethod = payMethod.value === 'card' ? '1' : '2' // 1信用卡/2PayPay
			await createPayment({
				order_id: orderId.value,
				payment_method: paymentMethod
			})
			
			uni.showToast({ title: t('order.paymentSuccess'), icon: 'success' })
			
			// 跳转到支付完成页面
			const next = payMethod.value === 'paypay' ? 'cashPayment' : 'completePayment'
			uni.redirectTo({ url: `/pages/order/detail?type=${next}&${detailQuery.value}` })
		} catch (error) {
			console.error('支付失败:', error)
			uni.showToast({ title: t('order.paymentFailed'), icon: 'none' })
		}
	}

	const handleReReserve = () => {
		uni.navigateTo({ url: '/pages/seat/booking' })
	}

	const goHome = () => {
		uni.reLaunch({ url: '/pages/home/home' })
	}
</script>

<style lang="scss" scoped>
	.detail-page {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: linear-gradient(180deg, #F8F9FF 0%, #FFFFFF 100%);
	}

	.detail-body {
		flex: 1;
		min-height: 0;
		height: 0;
	}

	.detail-body__inner {
		padding: 32rpx;
		padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
	}

	.detail-page--pending .detail-body__inner {
		padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
	}

	.status-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 16rpx 32rpx 40rpx;
	}

	.status-header__icon {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		background: #0058BE;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 24rpx;
	}

	.status-header__title {
		font-size: 48rpx;
		font-weight: 500;
		color: #0B1C30;
		line-height: 1.3;
		white-space: pre-wrap;
		margin-bottom: 16rpx;
	}

	.status-header__desc {
		font-size: 32rpx;
		color: #424754;
		line-height: 1.6;
		white-space: pre-wrap;
	}

	.detail-card {
		background: #FFFFFF;
		border: 1rpx solid #C2C6D6;
		border-radius: 24rpx;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
		margin-bottom: 24rpx;
		overflow: hidden;
	}

	.amount-card {
		padding: 40rpx 48rpx;
		text-align: center;
		border-color: #E8EBF5;
	}

	.amount-card__label {
		display: block;
		font-size: 28rpx;
		color: #64748B;
		margin-bottom: 16rpx;
	}

	.amount-card__value {
		display: block;
		font-size: 72rpx;
		font-weight: 500;
		color: #1E293B;
		line-height: 1.1;
	}

	.venue-card__image {
		display: block;
		width: 100%;
		height: 320rpx;
	}

	.venue-card__body {
		padding: 32rpx;
	}

	.venue-card__name {
		display: block;
		font-size: 36rpx;
		font-weight: 500;
		color: #0B1C30;
		margin-bottom: 16rpx;
		line-height: 1.4;
	}

	.venue-card__address {
		display: flex;
		align-items: flex-start;
		gap: 12rpx;

		text {
			flex: 1;
			font-size: 28rpx;
			color: #424754;
			line-height: 1.6;
			white-space: pre-wrap;
		}
	}

	.qr-card {
		padding: 48rpx 32rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.qr-card__title {
		font-size: 32rpx;
		font-weight: 500;
		color: #0B1C30;
		margin-bottom: 32rpx;
	}

	.qr-card__code {
		position: relative;
		padding: 24rpx;
		background: #F3F4F6;
		border-radius: 16rpx;
		border: 2rpx solid transparent;
		transition: border-color 0.2s;

		&--verified {
			border-color: #0058BE;
			background: #EFF4FF;
		}
	}

	.qr-card__verified {
		position: absolute;
		right: 16rpx;
		top: 16rpx;
		width: 48rpx;
		height: 48rpx;
		border-radius: 50%;
		background: #0058BE;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.qr-card__hint {
		margin-top: 24rpx;
		font-size: 28rpx;
		color: #424754;
		text-align: center;
		line-height: 1.5;
	}

	.qr-card__simulate {
		margin-top: 12rpx;
		font-size: 24rpx;
		color: #0058BE;
		text-align: center;
	}

	.info-card {
		padding: 32rpx;
	}

	.info-card__title {
		display: block;
		font-size: 32rpx;
		font-weight: 500;
		color: #0B1C30;
		margin-bottom: 32rpx;
	}

	.info-card__item {
		margin-bottom: 32rpx;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.info-card__label {
		display: block;
		font-size: 24rpx;
		color: #424754;
		margin-bottom: 12rpx;
	}

	.info-card__value-row {
		display: flex;
		align-items: center;
		gap: 16rpx;

		text {
			font-size: 32rpx;
			color: #0B1C30;
			line-height: 1.5;
		}
	}

	.info-card__icon {
		width: 40rpx;
		height: 40rpx;
		flex-shrink: 0;

		&--payment {
			width: 40rpx;
			height: 40rpx;
		}
	}

	.info-card__price {
		font-size: 56rpx !important;
		color: #D40000 !important;
		font-weight: 600;
	}

	.schedule-section {
		margin-top: 32rpx;
		padding-top: 32rpx;
	}

	.schedule-section__divider {
		height: 1rpx;
		background: #C2C6D6;
		margin-bottom: 32rpx;
	}

	.schedule-section__title {
		display: block;
		font-size: 28rpx;
		color: #424754;
		margin-bottom: 32rpx;
	}

	.schedule-timeline {
		position: relative;
		padding-left: 8rpx;
		margin-bottom: 32rpx;
	}

	.schedule-timeline__line {
		position: absolute;
		left: 15rpx;
		top: 20rpx;
		bottom: 20rpx;
		width: 2rpx;
		background: #C2C6D6;
	}

	.schedule-item {
		display: flex;
		gap: 24rpx;
		margin-bottom: 40rpx;
		position: relative;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.schedule-item__dot {
		width: 32rpx;
		height: 32rpx;
		border-radius: 50%;
		border: 4rpx solid #727785;
		background: #FFFFFF;
		flex-shrink: 0;
		margin-top: 4rpx;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;

		&--active {
			border-color: #0058BE;
		}
	}

	.schedule-item__dot-inner {
		width: 16rpx;
		height: 16rpx;
		border-radius: 50%;
		background: #0058BE;
	}

	.schedule-item__content {
		flex: 1;
	}

	.schedule-item__label {
		display: block;
		font-size: 28rpx;
		color: #424754;
		margin-bottom: 8rpx;

		&--active {
			color: #0058BE;
			font-weight: 500;
		}
	}

	.schedule-item__time {
		display: block;
		font-size: 28rpx;
		color: #0B1C30;
		line-height: 1.5;
	}

	.schedule-section__btn {
		margin-top: 32rpx;
		background: #0058BE;
		border-radius: 16rpx;
		padding: 24rpx;
		text-align: center;

		text {
			color: #FFFFFF;
			font-size: 32rpx;
			line-height: 1.5;
		}
	}

	.payment-section {
		margin-bottom: 24rpx;
	}

	.payment-section__title {
		display: block;
		font-size: 28rpx;
		color: #424754;
		margin-bottom: 24rpx;
	}

	.payment-option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 28rpx 32rpx;
		background: #FFFFFF;
		border: 1rpx solid #C2C6D6;
		border-radius: 24rpx;
		margin-bottom: 16rpx;

		&.active {
			border-color: #0058BE;
			background: #EFF4FF;
		}

		&:last-child {
			margin-bottom: 0;
		}
	}

	.payment-option__left {
		display: flex;
		align-items: center;
		gap: 24rpx;

		text {
			font-size: 32rpx;
			color: #0B1C30;
		}
	}

	.payment-option__icon-wrap {
		width: 72rpx;
		height: 72rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		&--card {
			background: rgba(0, 88, 190, 0.1);
		}

		&--paypay {
			background: #FFF4E5;
		}
	}

	.payment-option__icon {
		width: 40rpx;
		height: 40rpx;
	}

	.payment-option__radio {
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		border: 4rpx solid #C2C6D6;
		display: flex;
		align-items: center;
		justify-content: center;

		&.active {
			border-color: #0058BE;
		}
	}

	.inline-action {
		padding: 16rpx 0 32rpx;
	}

	.inline-action__btn {
		background: #0058BE;
		border-radius: 16rpx;
		padding: 24rpx;
		text-align: center;

		text {
			color: #FFFFFF;
			font-size: 32rpx;
			line-height: 1.5;
		}
	}
</style>