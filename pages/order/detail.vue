<template>
	<view class="detail-page" :class="{ 'detail-page--pending': type === 'pendingPayment' }">
		<PageLoading :visible="!dataLoaded" type="detail" />
		<PageHeader :title="pageTitle" show-lang background="rgba(248, 249, 255, 0.8)" back-color="#0058BE" />
		<PullRefresh class="detail-body" :refresh="onRefresh">
			<view class="detail-body__inner" v-if="dataLoaded">
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
						<uv-icon name="checkmark" color="#FFFFFF" size="52" />
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
						<text class="venue-card__name">{{ venueName }}</text>
						<view class="venue-card__address">
							<uv-icon name="map" color="#0058BE" size="20" />
							<text>{{ displayVenueAddress }}</text>
						</view>
					</view>
				</view>

				<!-- 预约 QR（点击模拟现场核销） -->
				<view v-if="type === 'reserved' || type === 'arrived'" class="detail-card qr-card">
					<text
						class="qr-card__title">{{ type === 'arrived' ? t('order.qrTitleExit') : t('order.qrTitle') }}</text>
					<view class="qr-card__code"
						:class="{ 'qr-card__code--verified': type === 'arrived' || isCheckedIn }"
						@click="simulateCheckIn">
						<uv-qrcode v-if="qrUrl && !qrLoadError" :value="qrUrl" size="300rpx" :canvas-id="`qr-${orderId}`" @error="handleQrError" />
						<view v-if="qrLoadError" class="qr-fallback">
							<text class="qr-fallback__text">{{ qrUrl }}</text>
						</view>
						<view v-if="type === 'arrived' || isCheckedIn" class="qr-card__verified">
							<uv-icon name="checkmark" color="#FFFFFF" size="20" />
						</view>
					</view>
					<text class="qr-card__hint">{{ qrHintText }}</text>
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

					<!-- 核销成功后显示入退場时间线（仅 reserved/arrived 状态显示） -->
					<view v-if="(isCheckedIn || type === 'arrived') && type !== 'pendingPayment'"
						class="schedule-section">
						<view class="schedule-section__divider" />
						<text class="schedule-section__title">{{ t('order.entrySchedule') }}</text>
						<view class="schedule-timeline">
							<view class="schedule-timeline__line" />
							<view v-if="checkinTime" class="schedule-item">
								<view class="schedule-item__dot schedule-item__dot--active">
									<view class="schedule-item__dot-inner" />
								</view>
								<view class="schedule-item__content">
									<text
										class="schedule-item__label schedule-item__label--active">{{ t('order.checkIn') }}</text>
									<text class="schedule-item__time">{{ checkInText }}</text>
								</view>
							</view>
							<view v-if="checkoutTime" class="schedule-item">
								<view class="schedule-item__dot schedule-item__dot--active">
									<view class="schedule-item__dot-inner" />
								</view>
								<view class="schedule-item__content">
									<text
										class="schedule-item__label schedule-item__label--active">{{ t('order.checkOut') }}</text>
									<text class="schedule-item__time">{{ checkOutText }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 料金 -->
				<view v-if="type === 'pendingPayment' || type === 'completePayment' || type === 'cashPayment'"
					class="detail-card info-card">
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

				<!-- 注意事项（所有状态都显示） -->
				<view class="notice-section">
					<text class="notice-section__title">{{ t('seat.precautionsTitle') }}</text>
					<view v-if="payNoticeLoading" class="notice-section__loading">
						<text>{{ t('common.loading') }}</text>
					</view>
					<view v-else-if="payNoticeList.length > 0" class="notice-section__list">
						<view v-for="(item, index) in payNoticeList" :key="index" class="notice-section__item">
							<image class="notice-section__icon" :src="getImageUrl(item.icon)" mode="aspectFit" />
							<text
								class="notice-section__item-text">{{ locale === 'en' ? (item.content_en || item.content) : item.content }}</text>
						</view>
					</view>
					<view v-else class="notice-section__list">
						<view v-for="item in fallbackPrecautions" :key="item.key" class="notice-section__item">
							<image class="notice-section__icon" :src="item.icon" mode="aspectFit" />
							<text class="notice-section__item-text">{{ t(item.key) }}</text>
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

				<!-- 预约中取消按钮 -->
				<view v-if="type === 'reserved'" class="inline-action">
					<view class="inline-action__btn inline-action__btn--danger" @click="handleCancelReservation">
						<text>{{ t('order.cancelOrder') }}</text>
					</view>
				</view>

				<!-- 支付完成内嵌按钮 -->
				<view v-if="type === 'completePayment' || type === 'cashPayment'" class="inline-action">
					<view class="inline-action__btn" @click="goHome">
						<text>{{ t('order.backToHome') }}</text>
					</view>
				</view>
			</view>
		</PullRefresh>

		<BottomActionBar v-if="type === 'pendingPayment'" :text="t('order.payNow')" @click="handlePay" />

		<!-- 取消预约确认弹窗 -->
		<uv-popup ref="cancelPopupRef" mode="center" round="12" :z-index="10080" :overlay-opacity="0.6"
			:close-on-click-overlay="false">
			<view class="cancel-notice">
				<view class="cancel-notice__body">
					<text class="cancel-notice__title">{{ t('order.cancelOrder') }}</text>
					<text class="cancel-notice__desc">{{ t('order.cancelConfirmDesc') }}</text>
				</view>
				<view class="cancel-notice__actions">
					<view class="cancel-notice__btn cancel-notice__btn--danger" @click="confirmCancel">
						<text>{{ cancelLoading ? t('common.loading') : t('order.confirmCancel') }}</text>
					</view>
					<view class="cancel-notice__btn cancel-notice__btn--ghost" @click="closeCancelPopup">
						<text>{{ t('common.cancel') }}</text>
					</view>
				</view>
			</view>
		</uv-popup>

		<LanguagePopupHost />
	</view>
</template>

<script setup lang="ts">
	import { ref, computed, onMounted } from 'vue'
	import { onLoad, onShow } from '@dcloudio/uni-app'
	import { formatTimestampTokyo } from '@/utils/timezone'
	import { useLocale } from '@/composables/useLocale'
	import { usePayment } from '@/composables/usePayment'
	import { useReservationOrder } from '@/composables/useReservationOrder'
	import { icons } from '@/utils/icons'
	import { getImageUrl } from '@/src/config/env'
	import api from '@/utils/api'
	import PageHeader from '@/components/PageHeader.vue'
	import BottomActionBar from '@/components/BottomActionBar.vue'
	import LanguagePopupHost from '@/components/LanguagePopupHost.vue'
	import PullRefresh from '@/components/PullRefresh.vue'
	import PageLoading from '@/components/PageLoading.vue'

	const { t, locale } = useLocale()
	const { createStripePayment, loading: paymentLoading } = usePayment()
	const { getOrderDetail, cancelReservation } = useReservationOrder()

	const payNoticeList = ref<Array<{ content : string; icon : string }>>([])
	const payNoticeLoading = ref(false)

	// 备用注意事项数据（当 API 调用失败时使用）
	const fallbackPrecautions = [
		{ key: 'seat.precaution1', icon: '/static/images/facilities/silence.png' },
		{ key: 'seat.precaution2', icon: '/static/images/smoking.png' },
		{ key: 'seat.precaution3', icon: '/static/images/animals.png' },
		{ key: 'seat.precaution4', icon: '/static/images/food.png' },
		{ key: 'seat.precaution5', icon: '/static/images/clean.png' },
		{ key: 'seat.precaution6', icon: '/static/images/time.png' },
		{ key: 'seat.precaution7', icon: '/static/images/fire.png' },
		{ key: 'seat.precaution8', icon: '/static/images/locks.png' }
	]

	// 获取支付注意事项（无条件请求，模板层用 v-if 控制显隐）
	const fetchPayNotice = async () => {
		payNoticeLoading.value = true
		try {
			const response = await api.GetPayNotice()
			console.log('[fetchPayNotice] response:', JSON.stringify(response))
			// 兼容多种响应结构: { data: { notices: [] } } 或 { data: [] }
			const notices = response?.data?.notices ?? response?.data ?? null
			if (Array.isArray(notices) && notices.length > 0) {
				payNoticeList.value = notices
			} else {
				payNoticeList.value = []
			}
		} catch (error) {
			console.error('获取支付注意事项失败:', error)
			payNoticeList.value = []
		} finally {
			payNoticeLoading.value = false
		}
	}

	const type = ref('reserved')
	const orderId = ref('')
	const qrUrl = ref('')
	const qrLoadError = ref(false)
	const venueId = ref('')
	const venueName = ref('')
	const venueNameEn = ref('')
	const venueCover = ref('')
	const venueAddress = ref('')
	const venueAddressEn = ref('')
	// 场馆预约参数（用于再度予約跳转）
	const venueAdvanceDays = ref(7)
	const venueCheckinGraceMinutes = ref(15)
	const venueCloseTime = ref('22:00')
	const venueOpenTime = ref('09:00')
	const venueMinBillMinutes = ref(30)
	const venuePricePerMinute = ref(0)
	const venueTotalSeats = ref(0)
	const date = ref('')
	const time = ref('')
	const seat = ref('')
	const price = ref(0)
	const payMethod = ref<'card' | 'paypay'>('card')
	const checkedIn = ref(false)
	const checkedOut = ref(false)
	const checkinTime = ref<number | null>(null)   // 实际入场时间戳
	const checkoutTime = ref<number | null>(null)  // 实际退场时间戳
	const dataLoaded = ref(false)

	const venueDefaultImage = '/static/images/venues/venue-3.png'

	onLoad((query) => {
		console.log('[detail onLoad] ===== 页面加载 =====')
		console.log('[detail onLoad] window.location.href:', window.location.href)
		console.log('[detail onLoad] query:', JSON.stringify(query))
		if (query?.orderId) orderId.value = query.orderId as string
		console.log('[detail onLoad] orderId 赋值为:', orderId.value)
	})

	onShow(() => {
		console.log('[detail onShow] ===== 页面显示 =====')
		console.log('[detail onShow] href:', window.location.href)
		console.log('[detail onShow] orderId 当前值:', orderId.value)
		console.log('[detail onShow] ss pay_order_id:', sessionStorage.getItem('pay_order_id'))
		console.log('[detail onShow] ss pay_payment_no:', sessionStorage.getItem('pay_payment_no'))
	})

	onMounted(async () => {
		// BFCache 恢复时（用户从 Stripe 点返回），pageshow 的 persisted=true
		// 此时 Vue 生命周期不会重新执行，需要监听 pageshow 来强制刷新
		window.addEventListener('pageshow', (e) => {
			if (e.persisted) {
				console.log('[detail pageshow] BFCache 恢复，强制 reload')
				window.location.reload()
			}
		})

		// 如果有订单ID，从接口拉取最新数据（覆盖 URL 参数中的旧快照）
		if (orderId.value) {
			try {
				const orderDetail = await getOrderDetail(orderId.value)
				if (orderDetail) {
					// 更新页面数据
					date.value = orderDetail.reserve_date
					time.value = `${orderDetail.start_time} - ${orderDetail.end_time}`
					price.value = orderDetail.amount
					if ((orderDetail as any).qr_url) qrUrl.value = (orderDetail as any).qr_url
					if ((orderDetail as any).venue?.name) venueName.value = (orderDetail as any).venue.name
					if ((orderDetail as any).venue?.name_en) venueNameEn.value = (orderDetail as any).venue.name_en
					if ((orderDetail as any).venue?.cover_image) venueCover.value = (orderDetail as any).venue.cover_image
					if ((orderDetail as any).venue?.address) venueAddress.value = (orderDetail as any).venue.address
					if ((orderDetail as any).venue?.address_en) venueAddressEn.value = (orderDetail as any).venue.address_en
					// 保存场馆ID和预约相关参数，供再度予約使用
					if ((orderDetail as any).venue?.id) venueId.value = String((orderDetail as any).venue.id)
					if ((orderDetail as any).venue?.advance_days) venueAdvanceDays.value = Number((orderDetail as any).venue.advance_days)
					if ((orderDetail as any).venue?.checkin_grace_minutes) venueCheckinGraceMinutes.value = Number((orderDetail as any).venue.checkin_grace_minutes)
					if ((orderDetail as any).venue?.close_time) venueCloseTime.value = (orderDetail as any).venue.close_time
					if ((orderDetail as any).venue?.open_time) venueOpenTime.value = (orderDetail as any).venue.open_time
					if ((orderDetail as any).venue?.min_bill_minutes) venueMinBillMinutes.value = Number((orderDetail as any).venue.min_bill_minutes)
					if ((orderDetail as any).venue?.price_per_minute) venuePricePerMinute.value = Number((orderDetail as any).venue.price_per_minute)
					if ((orderDetail as any).venue?.total_seats) venueTotalSeats.value = Number((orderDetail as any).venue.total_seats)

					// 实际入退场时间戳
					checkinTime.value = (orderDetail as any).checkin_time || null
					checkoutTime.value = (orderDetail as any).checkout_time || null

					// 根据后端实际 status 决定页面 type
					const apiStatus = (orderDetail as any).status
					const apiPayType = (orderDetail as any).pay_type
					if (apiStatus === 4 || apiStatus === '4') {
						type.value = apiPayType === 3 || apiPayType === '3' ? 'cashPayment' : 'completePayment'
					} else if (apiStatus === 3 || apiStatus === '3') {
						type.value = 'pendingPayment'
					} else if (apiStatus === 2 || apiStatus === '2') {
						type.value = 'arrived'
					} else if (apiStatus === 5 || apiStatus === '5') {
						type.value = 'cancelled'
					} else {
						type.value = 'reserved'
					}

					dataLoaded.value = true
				}
			} catch (error) {
				console.error('获取订单详情失败:', error)
				dataLoaded.value = true // 失败时也标记，避免一直空白
			}
		} else {
			dataLoaded.value = true
		}

		// 获取支付注意事项
		await fetchPayNotice()
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

	const venueImage = computed(() => getImageUrl(venueCover.value || venueDefaultImage))
	const displayDate = computed(() => date.value)
	const formattedPrice = computed(() => `${price.value.toLocaleString()}円`)

	// 根据语言显示对应地址，无数据时回退到 locale 默认值
	const displayVenueAddress = computed(() => {
		if (locale.value === 'en') {
			return venueAddressEn.value || venueAddress.value || t('order.venueAddress')
		}
		return venueAddress.value || t('order.venueAddress')
	})

	const isCheckedIn = computed(() => (type.value !== 'arrived' && checkedIn.value))
	const isCheckedOut = computed(() => type.value === 'arrived' || checkedOut.value)

	const qrHintText = computed(() => {
		if (type.value === 'arrived') return t('order.qrExitHint')
		if (isCheckedIn.value) return t('order.qrVerified')
		return t('order.qrHint')
	})

	const showReservationDetails = computed(() =>
		['reserved', 'arrived', 'cancelled', 'pendingPayment', 'completePayment', 'cashPayment'].includes(type.value)
	)

	const timeParts = computed(() => time.value.split(' - ').map(part => part.trim()))
	const checkInText = computed(() => formatTimestampTokyo(checkinTime.value))
	const checkOutText = computed(() => formatTimestampTokyo(checkoutTime.value))

	const entryExitText = computed(() => {
		const range = time.value.replace(' - ', '-')
		return `${displayDate.value} ${range}`
	})

	const handleQrError = (error) => {
		console.error('[detail] QR码组件加载失败:', error)
		qrLoadError.value = true
	}

	const simulateCheckIn = () => {
		if (type.value === 'arrived') {
			// 退场扫码：模拟核销后自动跳转支付页
			uni.showToast({ title: t('order.checkOutSuccess'), icon: 'success', duration: 1200 })
			setTimeout(() => {
				goPendingPayment()
			}, 1200)
			return
		}
		// reserved 状态：模拟入场核销
		if (type.value !== 'reserved' || isCheckedIn.value) return
		checkedIn.value = true
		uni.showToast({ title: t('order.checkInSuccess'), icon: 'success' })
	}

	const goPendingPayment = () => {
		uni.redirectTo({ url: `/pages/order/detail?orderId=${orderId.value}` })
	}


	const handlePay = async () => {
		console.log('[handlePay] href:', window.location.href)
		console.log('[handlePay] origin:', window.location.origin)
		console.log('[handlePay] orderId:', orderId.value, 'payMethod:', payMethod.value)

		try {
			uni.showLoading({ title: t('order.paymentProcessing') || '処理中...', mask: true })

			// pay_type: 1=信用卡 2=PayPay
			const payType = payMethod.value === 'paypay' ? '2' : '1'

			const payData = await createStripePayment(orderId.value, payType)

			console.log('[handlePay] payData:', JSON.stringify(payData))

			uni.hideLoading()

			if (!payData || !payData.payment_url) {
				uni.showToast({ title: t('order.paymentFailed'), icon: 'none' })
				return
			}

			// 存入 sessionStorage，支付成功后 payment-result 页读取
			sessionStorage.setItem('pay_payment_url', payData.payment_url)
			sessionStorage.setItem('pay_payment_no', payData.payment_no)
			sessionStorage.setItem('pay_order_id', orderId.value)

			console.log('[handlePay] 跳转 Stripe:', payData.payment_url.slice(0, 60))
			// 直接跳转到 Stripe，不经过 payment-webview 中间页
			window.location.replace(payData.payment_url)
		} catch (error) {
			uni.hideLoading()
			console.error('[handlePay] 支付失败:', error)
			uni.showToast({ title: t('order.paymentFailed'), icon: 'none' })
		}
	}

	const handleReReserve = () => {
		const id = venueId.value || '1'
		const coverParam = venueCover.value ? `&cover_image=${encodeURIComponent(venueCover.value)}` : ''
		uni.navigateTo({
			url: `/pages/seat/date?venueId=${id}${coverParam}&advance_days=${venueAdvanceDays.value}&checkin_grace_minutes=${venueCheckinGraceMinutes.value}&close_time=${venueCloseTime.value}&open_time=${venueOpenTime.value}&min_bill_minutes=${venueMinBillMinutes.value}&price_per_minute=${venuePricePerMinute.value}&total_seats=${venueTotalSeats.value}`
		})
	}

	const cancelPopupRef = ref<{ open : () => void; close : () => void } | null>(null)
	const cancelLoading = ref(false)

	const handleCancelReservation = () => {
		cancelPopupRef.value?.open()
	}

	const closeCancelPopup = () => {
		cancelPopupRef.value?.close()
	}

	const confirmCancel = async () => {
		if (cancelLoading.value) return
		cancelLoading.value = true
		try {
			const response = await cancelReservation(orderId.value) as any
			cancelPopupRef.value?.close()
			if (response && response.code === 1) {
				uni.showToast({ title: t('order.cancelSuccess'), icon: 'success' })
				type.value = 'cancelled'
			} else {
				uni.showToast({ title: response?.msg || t('common.requestFailed'), icon: 'none' })
			}
		} catch (e) {
			uni.showToast({ title: t('common.requestFailed'), icon: 'none' })
		} finally {
			cancelLoading.value = false
		}
	}

	const goHome = () => {
		uni.reLaunch({ url: '/pages/home/home' })
	}

	const onRefresh = async () => {
		if (orderId.value) {
			try {
				const orderDetail = await getOrderDetail(orderId.value)
				if (orderDetail) {
					date.value = orderDetail.reserve_date
					time.value = `${orderDetail.start_time} - ${orderDetail.end_time}`
					price.value = orderDetail.amount
					if ((orderDetail as any).qr_url) qrUrl.value = (orderDetail as any).qr_url
					if ((orderDetail as any).venue?.name) venueName.value = (orderDetail as any).venue.name
					if ((orderDetail as any).venue?.cover_image) venueCover.value = (orderDetail as any).venue.cover_image
					if ((orderDetail as any).venue?.address) venueAddress.value = (orderDetail as any).venue.address
					if ((orderDetail as any).venue?.address_en) venueAddressEn.value = (orderDetail as any).venue.address_en
					if ((orderDetail as any).venue?.id) venueId.value = String((orderDetail as any).venue.id)
					if ((orderDetail as any).venue?.advance_days) venueAdvanceDays.value = Number((orderDetail as any).venue.advance_days)
					if ((orderDetail as any).venue?.checkin_grace_minutes) venueCheckinGraceMinutes.value = Number((orderDetail as any).venue.checkin_grace_minutes)
					if ((orderDetail as any).venue?.close_time) venueCloseTime.value = (orderDetail as any).venue.close_time
					if ((orderDetail as any).venue?.open_time) venueOpenTime.value = (orderDetail as any).venue.open_time
					if ((orderDetail as any).venue?.min_bill_minutes) venueMinBillMinutes.value = Number((orderDetail as any).venue.min_bill_minutes)
					if ((orderDetail as any).venue?.price_per_minute) venuePricePerMinute.value = Number((orderDetail as any).venue.price_per_minute)
					if ((orderDetail as any).venue?.total_seats) venueTotalSeats.value = Number((orderDetail as any).venue.total_seats)

					// 刷新时同步修正页面类型
					const apiStatus = (orderDetail as any).status
					const apiPayType = (orderDetail as any).pay_type
					if (apiStatus === 4 || apiStatus === '4') {
						type.value = apiPayType === 3 || apiPayType === '3' ? 'cashPayment' : 'completePayment'
					} else if (apiStatus === 3 || apiStatus === '3') {
						type.value = 'pendingPayment'
					} else if (apiStatus === 2 || apiStatus === '2') {
						type.value = 'arrived'
					} else if (apiStatus === 5 || apiStatus === '5') {
						type.value = 'cancelled'
					} else if (apiStatus === 1 || apiStatus === '1') {
						type.value = 'reserved'
					}
				}
			} catch (error) {
				console.error('刷新订单详情失败:', error)
			}
		}
		// 同步刷新注意事项
		await fetchPayNotice()
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
		text-align: center;
		width: 100%;
	}

	.qr-card__code {
		position: relative;
		padding: 24rpx;
		background: #F3F4F6;
		border-radius: 16rpx;
		border: 2rpx solid transparent;
		transition: border-color 0.2s;
		display: flex;
		justify-content: center;
		align-items: center;

		:deep(.uqrcode) {
			margin: 0 auto !important;
		}

		&--verified {
			border-color: #0058BE;
			background: #EFF4FF;
		}
	}

	.qr-card__qr-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
	}

	.qr-card__image {
		width: 320rpx;
		height: 320rpx;
		display: block;
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

	.qr-fallback {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24rpx;
		min-height: 300rpx;
		background: #F3F4F6;
		border-radius: 16rpx;
	}

	.qr-fallback__text {
		font-size: 24rpx;
		color: #64748B;
		text-align: center;
		word-break: break-all;
		max-width: 100%;
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

	.notice-section {
		margin-bottom: 24rpx;
		padding: 32rpx;
		background: #FFFFFF;
		border: 1rpx solid #C2C6D6;
		border-radius: 24rpx;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
	}

	.notice-section__title {
		display: block;
		font-size: 28rpx;
		font-weight: 500;
		color: #0B1C30;
		margin-bottom: 24rpx;
	}

	.notice-section__loading {
		text-align: center;
		padding: 40rpx 0;
	}

	.notice-section__list {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.notice-section__item {
		display: flex;
		align-items: center;
		gap: 20rpx;
		padding: 20rpx 24rpx;
		background: #F8F9FF;
		border-radius: 12rpx;
	}

	.notice-section__icon {
		width: 40rpx;
		height: 40rpx;
		flex-shrink: 0;
	}

	.notice-section__item-text {
		flex: 1;
		font-size: 26rpx;
		color: #424754;
		line-height: 1.5;
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

		&--danger {
			background: #FFFFFF;
			border: 1rpx solid #D40000;

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