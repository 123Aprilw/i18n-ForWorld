<template>
	<view class="seat-page">
		<PageLoading :visible="pageLoading" type="venue" />
		<PageHeader :title="t('seat.title')" show-lang glass />
		<PullRefresh class="seat-body" :refresh="onRefresh">
			<view class="seat-hero">
				<image class="seat-hero__image" :src="getImageUrl(coverImage || '/static/images/venues/hero-1.png')" mode="aspectFill" />
				<view class="seat-hero__gradient" />
			</view>

			<view class="seat-section">
				<view class="seat-section__head">
					<view class="seat-section__label">
						<view class="seat-section__bar" />
						<text>{{ t('seat.selectDate') }}</text>
					</view>
					<view class="seat-section__meta" @click="openCalendar">
						<text class="seat-section__month">{{ monthLabel }}</text>
						<image class="seat-section__calendar-icon" :src="icons.yuyue" mode="aspectFit" />
					</view>
				</view>
				<view class="seat-field" @click="openCalendar">
					<text class="seat-field__text" :class="{ 'seat-field__text--placeholder': !hasDate }">
						{{ dateDisplay }}
					</text>
				</view>
			</view>

			<view class="seat-section seat-section--time">
				<view class="seat-section__label">
					<view class="seat-section__bar" />
					<text>{{ t('seat.reservationTime') }}</text>
				</view>
				<view class="seat-time-row">
					<view class="seat-time-col">
						<text class="seat-time-col__label">{{ t('seat.selectStartTime') }}</text>
						<view class="seat-field seat-field--time" @click="openTimePicker('start')">
							<text class="seat-field__text">{{ startTime }}</text>
							<image class="seat-field__clock" :src="icons.time" mode="aspectFit" />
						</view>
					</view>
					<view class="seat-time-col">
						<text class="seat-time-col__label">{{ t('seat.selectEndTime') }}</text>
						<view class="seat-field seat-field--time" @click="openTimePicker('end')">
							<text class="seat-field__text">{{ endTime }}</text>
							<image class="seat-field__clock" :src="icons.time" mode="aspectFit" />
						</view>
					</view>
				</view>
			</view>

			<view class="status-card" :class="{ 'status-card--full': isFull }">
				<view class="status-card__left">
					<view class="status-card__status-row">
						<view class="status-card__dot" :class="{ 'status-card__dot--full': isFull }" />
						<text
							class="status-card__status">{{ isFull ? t('seat.statusFull') : t('seat.statusAvailable') }}</text>
					</view>
					<text class="status-card__sub">
						{{ isFull ? otherTimesText : selectedRangeText }}
					</text>
				</view>
				<view class="status-card__right">
					<text class="status-card__seats-label">{{ t('seat.remainingSeats') }}</text>
					<text class="status-card__seats-count" :class="{ 'status-card__seats-count--full': isFull }">
						{{ totalSeats }}
					</text>
				</view>
			</view>

			<view class="precautions">
				<text class="precautions__title">{{ t('seat.precautionsTitle') }}</text>
				<view class="precautions__box">
					<view v-for="item in precautions" :key="item.key" class="precautions__item">
						<image class="precautions__icon" :src="item.icon" mode="aspectFit" />
						<view class="precautions__text">{{ item.customText || t(item.key) }}</view>
					</view>
				</view>
			</view>
		</PullRefresh>

		<BottomActionBar :text="bookingLoading ? (t('common.loading') || '処理中...') : isFull ? t('seat.changeTimeSlot') : t('common.confirmBooking')" :disabled="bookingLoading" @click="confirmBooking" />

		<uv-popup ref="unpaidPopupRef" mode="center" round="12" :z-index="10080" :overlay-opacity="0.6"
			:close-on-click-overlay="false">
			<view class="unpaid-notice">
				<view class="unpaid-notice__body">
					<text class="unpaid-notice__title">{{ t('seat.unpaidNoticeTitle') }}</text>
					<text class="unpaid-notice__desc">{{ t('seat.unpaidNoticeDesc') }}</text>
				</view>
				<view class="unpaid-notice__actions">
					<view class="unpaid-notice__btn unpaid-notice__btn--primary" @click="goPay">
						<text>{{ t('order.payNow') }}</text>
					</view>
					<view class="unpaid-notice__btn unpaid-notice__btn--ghost" @click="closeUnpaidNotice">
						<text>{{ t('seat.doLater') }}</text>
					</view>
				</view>
			</view>
		</uv-popup>

		<!-- 已有进行中订单弹窗 -->
		<uv-popup ref="activeOrderPopupRef" mode="center" round="12" :z-index="10080" :overlay-opacity="0.6"
			:close-on-click-overlay="true">
			<view class="unpaid-notice">
				<view class="unpaid-notice__icon">
					<uv-icon name="calendar" color="#0058BE" size="40" />
				</view>
				<view class="unpaid-notice__body">
					<text class="unpaid-notice__title">{{ t('seat.activeOrderTitle') }}</text>
					<text class="unpaid-notice__desc">{{ activeOrderMsg || t('seat.activeOrderDesc') }}</text>
				</view>
				<view class="unpaid-notice__actions">
					<view class="unpaid-notice__btn unpaid-notice__btn--primary" @click="goActiveOrder">
						<text>{{ t('seat.goToOrders') }}</text>
					</view>
					<view class="unpaid-notice__btn unpaid-notice__btn--ghost" @click="activeOrderPopupRef?.close()">
						<text>{{ t('common.cancel') }}</text>
					</view>
				</view>
			</view>
		</uv-popup>

		<uv-popup ref="calendarPopupRef" mode="center" round="24" :z-index="10075" :overlay-opacity="0.6"
			:close-on-click-overlay="true" @change="onCalendarPopupChange">
			<view class="calendar-popup">
				<view class="calendar-popup__header">
					<view class="calendar-popup__nav" @click="prevMonth">
						<text class="calendar-popup__nav-icon">‹</text>
					</view>
					<text class="calendar-popup__title">{{ monthLabel }}</text>
					<view class="calendar-popup__nav" @click="nextMonth">
						<text class="calendar-popup__nav-icon">›</text>
					</view>
				</view>
				<view class="calendar-popup__body">
					<view class="calendar-popup__weekdays">
						<text v-for="(d, wi) in weekdays" :key="d" class="calendar-popup__weekday"
							:class="{ 'calendar-popup__weekday--sun': wi === 0 }">{{ d }}</text>
					</view>
					<view class="calendar-popup__days">
						<view v-for="(day, i) in days" :key="i" class="calendar-popup__day" :class="{
								'calendar-popup__day--muted': day && day.muted,
								'calendar-popup__day--selected': day && !day.muted && day.value === tempDay,
								   'calendar-popup__day--today': day && !day.muted && day.isToday
							}" @click="selectDay(day)">
							<text v-if="day">{{ day.value }}</text>
						</view>
					</view>
				</view>
				<view class="calendar-popup__footer">
					<view class="calendar-popup__btn calendar-popup__btn--ghost" @click="closeCalendar">
						<text>{{ t('common.cancel') }}</text>
					</view>
					<view class="calendar-popup__btn calendar-popup__btn--primary" @click="confirmCalendar">
						<text>{{ t('common.confirm') }}</text>
					</view>
				</view>
			</view>
		</uv-popup>

		<uv-popup ref="timePopupRef" mode="bottom" round="24" :z-index="10076" :overlay-opacity="0.6"
			:close-on-click-overlay="true" @change="onTimePopupChange">
			<view class="time-popup">
				<view class="time-popup__header">
					<text class="time-popup__cancel" @click="closeTimePicker">{{ t('common.cancel') }}</text>
					<text class="time-popup__title">{{ t('seat.selectTimeTitle') }}</text>
					<text class="time-popup__confirm" @click="confirmTimePicker">{{ t('seat.confirmTime') }}</text>
				</view>
				<view class="time-popup__picker-wrap">
					<view class="time-popup__picker-inner">
						<view class="time-popup__selection-band" />
						<picker-view class="time-popup__picker" :value="pickerIndex"
							indicator-style="height: 88rpx; background: rgba(0,0,0,0); border: none;" immediate-change
							@change="onPickerChange">
							<picker-view-column>
								<view v-for="(hour, i) in hourOptions" :key="hour"
									class="time-popup__picker-item time-popup__picker-item--hour"
									:style="getHourTextStyle(i)">
									{{ hour }}
								</view>
							</picker-view-column>
							<picker-view-column>
								<view v-for="(minute, i) in minuteOptions" :key="minute"
									class="time-popup__picker-item time-popup__picker-item--minute"
									:style="getMinuteTextStyle(i)">
									{{ minute }}
								</view>
							</picker-view-column>
						</picker-view>
						<view class="time-popup__colon-wrap">
							<text class="time-popup__colon">:</text>
						</view>
					</view>
				</view>
			</view>
		</uv-popup>

		<LanguagePopupHost />
	</view>
</template>

<script setup lang="ts">
	import { ref, computed, nextTick, onMounted } from 'vue'
	import { onLoad, onShow } from '@dcloudio/uni-app'
	import { nowTokyo } from '@/utils/timezone'
	import { useLocale } from '@/composables/useLocale'
	import { useReservationOrder } from '@/composables/useReservationOrder'
	import { useLoading } from '@/composables/useLoading'
	import { useVenueDetail } from '@/composables/useVenueDetail'
	import { icons } from '@/utils/icons'
	import { orders } from '@/utils/mock'
	import { getImageUrl } from '@/src/config/env'
	import api from '@/utils/api'
	import PageHeader from '@/components/PageHeader.vue'
	import BottomActionBar from '@/components/BottomActionBar.vue'
	import LanguagePopupHost from '@/components/LanguagePopupHost.vue'
	import PullRefresh from '@/components/PullRefresh.vue'
	import PageLoading from '@/components/PageLoading.vue'

	const { t, locale } = useLocale()
	const { checkUnpaid, hasUnpaid, unpaidOrderId } = useReservationOrder()
	const { showLoading, hideLoading } = useLoading()
	const pageLoading = ref(true)
	const { fetchVenueDetail } = useVenueDetail()

	const payNoticeData = ref<any[]>([])
	const payNoticeLoading = ref(false)
	
	const venueId = ref('1')
	const spaceType = ref('')
	const advanceDays = ref(7)
	const checkinGraceMinutes = ref(15)
	const closeTime = ref('22:00')
	const coverImage = ref('')
	const minBillMinutes = ref(30)
	const openTime = ref('09:00')
	const pricePerMinute = ref(0)
	const totalSeats = ref(0)
	const today = nowTokyo()
	const year = ref(today.getFullYear())
	const month = ref(today.getMonth() + 1)
	const selectedDay = ref<number | null>(null)
	const tempDay = ref<number | null>(null)
	const startTime = ref('09:00')
	const endTime = ref('10:00')
	const timePickerTarget = ref<'start' | 'end'>('start')
	const pickerIndex = ref([1, 0])
	const tempTime = ref('09:00')

	const hourOptions = computed(() => {
		const startHour = parseInt(openTime.value?.split(':')[0] || '0')
		const endHour = parseInt(closeTime.value?.split(':')[0] || '23')
		const closeMinute = parseInt(closeTime.value?.split(':')[1] || '0')
		
		// 检查是否是今天
		const now = nowTokyo()
		const isToday = selectedDay.value !== null && 
			year.value === now.getFullYear() && 
			month.value === now.getMonth() + 1 && 
			selectedDay.value === now.getDate()
		
		let hours = Array.from({ length: endHour - startHour + 1 }, (_, i) =>
			String(startHour + i).padStart(2, '0')
		)

		// 如果 closeTime 的分钟部分是 0，则不包含结束小时
		if (closeMinute === 0) {
			hours = hours.filter(hour => parseInt(hour) < endHour)
		}

		if (isToday) {
			// 计算当前时间加上 grace 之后的下一个15分钟可用刻度
			const currentHour = now.getHours()
			const currentMinute = now.getMinutes()
			// 下一个可选的15分钟刻度（含 grace）
			const nextInterval = Math.ceil(currentMinute / 15) * 15

			hours = hours.filter(hour => {
				const h = parseInt(hour)
				// 早于当前小时的直接过滤
				if (h < currentHour) return false
				// 等于当前小时时：需要该小时内还有可用的分钟刻度（nextInterval < 60）
				if (h === currentHour) return nextInterval < 60
				return true
			})
		}
		
		// 如果选择的是结束时间，过滤掉早于开始时间的小时
		if (timePickerTarget.value === 'end') {
			const startHourValue = parseInt(startTime.value?.split(':')[0] || '0')
			hours = hours.filter(hour => parseInt(hour) >= startHourValue)
		}
		
		return hours
	})
	const minuteOptions = computed(() => {
		const closeHour = parseInt(closeTime.value?.split(':')[0] || '23')
		const closeMinute = parseInt(closeTime.value?.split(':')[1] || '0')
		
		// 获取当前选择的小时（从 pickerIndex 获取，避免循环依赖）
		const selectedHourIndex = pickerIndex.value[0]
		const currentHour = parseInt(hourOptions.value[selectedHourIndex] || '0')
		
		// 如果选择的是最后一个小时，分钟不能超过 closeMinute
		const maxMinute = currentHour === closeHour ? closeMinute : 59
		
		// 检查是否是今天
		const now = nowTokyo()
		const isToday = selectedDay.value !== null && 
			year.value === now.getFullYear() && 
			month.value === now.getMonth() + 1 && 
			selectedDay.value === now.getDate()
		
		// 始终使用15分钟间隔
		const allMinutes = ['00', '15', '30', '45']
		
		// 如果是今天且选择的是当前小时，需要过滤掉早于当前时间的分钟
		if (isToday && currentHour === now.getHours()) {
			const currentMinute = now.getMinutes()
			// 找到下一个15分钟间隔
			const nextInterval = Math.ceil(currentMinute / 15) * 15
			// nextInterval >= 60 意味着当前小时已无可用分钟，hourOptions 应已过滤掉此小时
			// 但作为防御返回空数组
			if (nextInterval >= 60) return []
			return allMinutes.filter(m => {
				const minuteValue = parseInt(m)
				return minuteValue <= maxMinute && minuteValue >= nextInterval
			})
		}
		
		// 如果选择的是结束时间，且当前选择的小时等于开始时间的小时，需要过滤掉早于开始时间的分钟
		if (timePickerTarget.value === 'end') {
			const startHourValue = parseInt(startTime.value?.split(':')[0] || '0')
			const startMinuteValue = parseInt(startTime.value?.split(':')[1] || '0')
			
			if (currentHour === startHourValue) {
				// 计算开始时间后的下一个15分钟间隔
				const startTotalMinutes = startHourValue * 60 + startMinuteValue
				const minEndMinutes = startTotalMinutes + 15
				// 调整为15分钟的倍数
				const adjustedEndMinutes = Math.ceil(minEndMinutes / 15) * 15
				
				// 如果调整后的结束时间在同一小时内，只显示该分钟及之后的选项
				if (adjustedEndMinutes < (startHourValue + 1) * 60) {
					const endMinuteInHour = adjustedEndMinutes % 60
					return allMinutes.filter(m => {
						const minuteValue = parseInt(m)
						return minuteValue <= maxMinute && minuteValue >= endMinuteInHour
					})
				} else {
					// 如果调整后的结束时间在下一小时或更晚，当前小时不显示任何分钟选项
					return []
				}
			}
		}
		
		return allMinutes.filter(m => parseInt(m) <= maxMinute)
	})

	const timeToMinutes = (time : string) => {
		const [h, m] = time.split(':').map(Number)
		return h * 60 + m
	}

	const minutesToTime = (total : number) => {
		const h = Math.floor(total / 60)
		const m = total % 60
		return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
	}

	const parseTime = (time : string) => {
		const [h, m] = time.split(':')
		const hourIndex = Math.max(0, hourOptions.value.indexOf(h))
		const minuteIndex = Math.max(0, minuteOptions.value.indexOf(m))
		return { hourIndex, minuteIndex }
	}

	const formatTime = (hourIndex : number, minuteIndex : number) => {
		const h = hourOptions.value[hourIndex]
		const m = minuteOptions.value[minuteIndex]
		if (h === undefined || m === undefined) return ''
		return `${h}:${m}`
	}

	const getHourTextStyle = (index : number) => {
		const active = pickerIndex.value[0] === index
		return {
			color: active ? '#424754' : '#C2C6D6',
			fontSize: '40rpx',
			fontWeight: '400'
		}
	}

	const getMinuteTextStyle = (index : number) => {
		const active = pickerIndex.value[1] === index
		return {
			color: active ? '#0058BE' : '#C2C6D6',
			fontSize: '40rpx',
			fontWeight: active ? '600' : '400'
		}
	}

	const calendarPopupRef = ref<{ open : () => void; close : () => void } | null>(null)
	const timePopupRef = ref<{ open : () => void; close : () => void } | null>(null)
	const unpaidPopupRef = ref<{ open : () => void; close : () => void } | null>(null)
	const activeOrderPopupRef = ref<{ open : () => void; close : () => void } | null>(null)
	const activeOrderMsg = ref('')
	const activeOrderId = ref('')

	// 使用API检查待支付订单，如果失败则回退到mock数据
	const hasUnpaidOrder = computed(() => hasUnpaid.value || orders.some(o => o.status === 'pending'))

	// 备用注意事项数据（当 API 调用失败时使用）
	const fallbackPrecautions = [
		{ key: 'seat.precaution1', icon: icons.seat.precaution1 },
		{ key: 'seat.precaution2', icon: icons.seat.precaution2 },
		{ key: 'seat.precaution3', icon: icons.seat.precaution3 },
		{ key: 'seat.precaution4', icon: icons.seat.precaution4 },
		{ key: 'seat.precaution5', icon: icons.seat.precaution5 },
		{ key: 'seat.precaution6', icon: icons.seat.precaution6 },
		{ key: 'seat.precaution7', icon: icons.seat.precaution7 },
		{ key: 'seat.precaution8', icon: icons.seat.precaution8 }
	]

	// 动态注意事项数据（优先使用 API 数据）
	const precautions = computed(() => {
		// 如果 API 返回了数据，使用 API 数据
		if (payNoticeData.value && payNoticeData.value.length > 0) {
			return payNoticeData.value.map((item, index) => {
				// 清理API返回的内容，将 white-space: pre 替换为 white-space: pre-wrap
				let cleanContent = item.content
					.replace(/white-space\s*:\s*pre\s*;/gi, 'white-space: pre-wrap;')
					.replace(/&nbsp;/g, ' ') // 替换HTML空格
					.trim()
				
				return {
					key: `seat.precaution${index + 1}`,
					icon: getImageUrl(item.icon),
					customText: cleanContent
				}
			})
		}
		// 否则使用备用数据
		return fallbackPrecautions
	})

	// 获取支付注意事项
	const fetchPayNotice = async () => {
		payNoticeLoading.value = true
		try {
			const response = await api.GetPayNotice()
			console.log('[fetchPayNotice seat] response:', JSON.stringify(response))
			// 兼容多种响应结构: { data: { notices: [] } } 或 { data: [] }
			const notices = response?.data?.notices ?? response?.data ?? null
			if (Array.isArray(notices) && notices.length > 0) {
				payNoticeData.value = notices
			} else {
				payNoticeData.value = []
			}
		} catch (error) {
			console.error('获取支付注意事项失败:', error)
			payNoticeData.value = []
		} finally {
			payNoticeLoading.value = false
		}
	}

	onLoad((query) => {
		if (query?.venueId) venueId.value = query.venueId as string
		if (query?.space) spaceType.value = query.space as string
	})

	const initializeReservationTime = () => {
		const now = nowTokyo()
		const currentHour = now.getHours()
		const currentMinute = now.getMinutes()
		const graceMinutes = checkinGraceMinutes.value

		let initialStartMinutes = currentHour * 60 + currentMinute + graceMinutes

		const openHour = parseInt(openTime.value.split(':')[0])
		const openMinute = parseInt(openTime.value.split(':')[1] || '0')
		const closeHour = parseInt(closeTime.value.split(':')[0])
		const closeMinute = parseInt(closeTime.value.split(':')[1] || '0')

		const openTotalMinutes = openHour * 60 + openMinute
		const closeTotalMinutes = closeHour * 60 + closeMinute

		// 判断当前是否是今天
		const isCurrentlyToday = selectedDay.value !== null &&
			year.value === now.getFullYear() &&
			month.value === now.getMonth() + 1 &&
			selectedDay.value === now.getDate()

		// 如果是今天且当前时间（含 grace）已超过或无法在营业时间内完成预约，自动切换到明天
		if (isCurrentlyToday && initialStartMinutes + 15 > closeTotalMinutes) {
			const tomorrow = new Date(now)
			tomorrow.setDate(tomorrow.getDate() + 1)

			// 检查明天是否在可预约范围内
			const maxDate = new Date(now)
			maxDate.setDate(maxDate.getDate() + advanceDays.value)

			if (tomorrow <= maxDate) {
				// 切换到明天
				year.value = tomorrow.getFullYear()
				month.value = tomorrow.getMonth() + 1
				selectedDay.value = tomorrow.getDate()
				tempDay.value = tomorrow.getDate()
			}

			// 无论是否切换到明天，都使用营业开始时间
			startTime.value = openTime.value
			const defaultEndMinutes = Math.min(openTotalMinutes + 15, closeTotalMinutes)
			const adjustedDefaultEnd = Math.ceil(defaultEndMinutes / 15) * 15
			endTime.value = minutesToTime(Math.min(adjustedDefaultEnd, closeTotalMinutes))
			return
		}

		// 确保开始时间不早于营业开始时间
		if (initialStartMinutes < openTotalMinutes) {
			initialStartMinutes = openTotalMinutes
		}

		// 根据15分钟间隔找到下一个可用的开始时间
		const allMinutes = [0, 15, 30, 45]
		const startHour = Math.floor(initialStartMinutes / 60)
		const startMinuteRaw = initialStartMinutes % 60

		// 找到当前小时之后的第一个15分钟刻度
		let nextMinute = allMinutes.find(m => m >= startMinuteRaw)
		let finalStartMinutes: number

		if (nextMinute !== undefined) {
			finalStartMinutes = startHour * 60 + nextMinute
		} else {
			// 当前小时没有可用分钟，进入下一小时的第一个刻度
			finalStartMinutes = (startHour + 1) * 60 + 0
		}

		// 确保最终开始时间不超过营业结束时间（需留至少15分钟）
		if (finalStartMinutes + 15 > closeTotalMinutes) {
			// 今天已无法预约，切换到明天
			const tomorrow = new Date(now)
			tomorrow.setDate(tomorrow.getDate() + 1)
			const maxDate = new Date(now)
			maxDate.setDate(maxDate.getDate() + advanceDays.value)

			if (tomorrow <= maxDate) {
				year.value = tomorrow.getFullYear()
				month.value = tomorrow.getMonth() + 1
				selectedDay.value = tomorrow.getDate()
				tempDay.value = tomorrow.getDate()
			}

			startTime.value = openTime.value
			const defaultEndMinutes = Math.min(openTotalMinutes + 15, closeTotalMinutes)
			const adjustedDefaultEnd = Math.ceil(defaultEndMinutes / 15) * 15
			endTime.value = minutesToTime(Math.min(adjustedDefaultEnd, closeTotalMinutes))
			return
		}

		startTime.value = minutesToTime(finalStartMinutes)
		// 结束时间为开始时间加15分钟，并调整为15分钟的倍数
		const endMinutes = finalStartMinutes + 15
		const adjustedEndMinutes = Math.ceil(endMinutes / 15) * 15
		endTime.value = minutesToTime(Math.min(adjustedEndMinutes, closeTotalMinutes))
	}

	onMounted(async () => {
		// 请求场馆详情，用接口数据填充页面所需字段
		if (venueId.value) {
			try {
				const data = await fetchVenueDetail(venueId.value)
				if (data) {
					advanceDays.value = data.advance_days || 7
					checkinGraceMinutes.value = data.checkin_grace_minutes || 15
					closeTime.value = data.close_time || '22:00'
					coverImage.value = data.cover_image || ''
					minBillMinutes.value = data.min_bill_minutes || 30
					openTime.value = data.open_time || '09:00'
					pricePerMinute.value = data.price_per_minute || 0
					totalSeats.value = data.total_seats || 0
				}
			} catch (error) {
				console.error('获取场馆详情失败，使用默认值:', error)
			}
		}

		// 获取支付注意事项
		await fetchPayNotice()
		
		// 默认选择今天
		const now = nowTokyo()
		selectedDay.value = now.getDate()
		year.value = now.getFullYear()
		month.value = now.getMonth() + 1

		// 初始化预约时间
		initializeReservationTime()

		// 数据加载完成，关闭 loading
		pageLoading.value = false
	})

	onShow(async () => {
		try {
			await checkUnpaid()
		} catch (error) {
			console.error('检查待支付订单失败:', error)
			// 如果API调用失败，回退到mock数据
		}
		
		if (hasUnpaid.value) {
			nextTick(() => unpaidPopupRef.value?.open())
		}

		// 刷新时更新预约时间
		initializeReservationTime()
	})

	const showUnpaidNotice = () => {
		unpaidPopupRef.value?.open()
	}

	const closeUnpaidNotice = () => {
		unpaidPopupRef.value?.close()
	}

	const goActiveOrder = () => {
		activeOrderPopupRef.value?.close()
		if (activeOrderId.value) {
			uni.navigateTo({ url: `/pages/order/detail?orderId=${activeOrderId.value}` })
		} else {
			uni.navigateTo({ url: '/pages/order/list?tab=reserved' })
		}
	}

	const goPay = () => {
		closeUnpaidNotice()
		const orderIdQuery = unpaidOrderId.value ? `&orderId=${unpaidOrderId.value}` : ''
		uni.navigateTo({ url: `/pages/order/detail?type=pendingPayment${orderIdQuery}` })
	}

	const weekdays = computed(() =>
		locale.value === 'jp'
			? ['日', '月', '火', '水', '木', '金', '土']
			: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
	)

	const hasDate = computed(() => selectedDay.value !== null)

	const monthLabel = computed(() =>
		locale.value === 'jp'
			? `${year.value}年${month.value}月`
			: `${year.value}/${String(month.value).padStart(2, '0')}`
	)

	const dateDisplay = computed(() => {
		if (!selectedDay.value) return t('seat.selectDatePlaceholder')
		if (locale.value === 'jp') {
			return `${year.value}年${month.value}月${selectedDay.value}日`
		}
		return `${year.value}-${String(month.value).padStart(2, '0')}-${String(selectedDay.value).padStart(2, '0')}`
	})

	const dateStr = computed(() => {
		if (!selectedDay.value) return ''
		return `${year.value}-${String(month.value).padStart(2, '0')}-${String(selectedDay.value).padStart(2, '0')}`
	})

	const timeRange = computed(() => `${startTime.value}-${endTime.value}`)

	const isFull = computed(() => {
		return totalSeats.value === 0
	})

	const selectedRangeText = computed(() =>
		t('seat.selectedTimeRange').replace('{range}', timeRange.value)
	)

	const otherTimesText = computed(() =>
		t('seat.otherAvailableTimes').replace('{times}', '09:00-10:00 10:00-12:00')
	)

	const days = computed(() => {
		const currentYear = year.value
		const currentMonth = month.value
		const now = nowTokyo()
		const todayY = now.getFullYear()
		const todayM = now.getMonth() + 1
		const todayD = now.getDate()
		const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay()
		const totalDays = new Date(currentYear, currentMonth, 0).getDate()
		const result : Array<{ value : number; muted ?: boolean; isToday ?: boolean }> = []

		// 判断今天是否还能预约（当前时间 + grace + 15分钟 < closeTime）
		const nowForCheck = nowTokyo()
		const currentTotalMinutes = nowForCheck.getHours() * 60 + nowForCheck.getMinutes() + checkinGraceMinutes.value
		const closeHourForCheck = parseInt(closeTime.value.split(':')[0] || '22')
		const closeMinuteForCheck = parseInt(closeTime.value.split(':')[1] || '0')
		const closeTotalForCheck = closeHourForCheck * 60 + closeMinuteForCheck
		const todayStillBookable = currentTotalMinutes + 15 <= closeTotalForCheck

		// 计算最小可预约日期：如果今天还能预约就是今天，否则是明天
		const minDate = new Date(todayY, todayM - 1, todayD)
		if (!todayStillBookable) {
			minDate.setDate(minDate.getDate() + 1)
		}
		const minY = minDate.getFullYear()
		const minM = minDate.getMonth() + 1
		const minD = minDate.getDate()

		// 计算最大可预约日期
		const maxDate = nowTokyo()
		maxDate.setDate(maxDate.getDate() + advanceDays.value)
		const maxY = maxDate.getFullYear()
		const maxM = maxDate.getMonth() + 1
		const maxD = maxDate.getDate()

		console.log('=== 日期计算调试 ===')
		console.log('advanceDays.value:', advanceDays.value)
		console.log('今天:', `${todayY}-${todayM}-${todayD}`)
		console.log('最大可预约日期:', `${maxY}-${maxM}-${maxD}`)
		console.log('当前显示月份:', `${currentYear}-${currentMonth}`)

		// 上月位置留白
		for (let i = 0; i < firstDay; i++) {
			result.push(null as any)
		}

		for (let d = 1; d <= totalDays; d++) {
			let isPast = false
			let isToday = false
			let isFuture = false

			// 判断是否是过去日期（早于今天）
			if (currentYear < minY) {
				isPast = true
			} else if (currentYear === minY && currentMonth < minM) {
				isPast = true
			} else if (currentYear === minY && currentMonth === minM && d < minD) {
				isPast = true
			}

			// 判断是否超过最大预约日期
			// 只有当前年份大于最大年份，或者当前年份等于最大年份且当前月份大于最大月份时，才是未来日期
			// 如果当前月份在最大日期月份之前，该月所有日期都可选
			if (currentYear > maxY) {
				isFuture = true
			} else if (currentYear === maxY && currentMonth > maxM) {
				isFuture = true
			} else if (currentYear === maxY && currentMonth === maxM && d > maxD) {
				isFuture = true
			}
			// 如果 currentYear < maxY，或者 currentYear === maxY && currentMonth < maxM，则该月所有日期都可选

			// 判断是否是今天
			if (currentYear === todayY && currentMonth === todayM && d === todayD) {
				isToday = true
			}

			// 调试日志：只打印前几个日期
			if (d <= 5 || d === 15 || d === 16) {
				console.log(`日期 ${d}: isPast=${isPast}, isFuture=${isFuture}, isToday=${isToday}`)
			}

			if (isPast || isFuture) {
				result.push({ value: d, muted: true })
			} else {
				result.push({ value: d, isToday })
			}
		}

		// 尾部补空对齐
		while (result.length % 7 !== 0) {
			result.push(null as any)
		}

		return result
	})

	const openCalendar = () => {
		tempDay.value = selectedDay.value
		calendarPopupRef.value?.open()
	}

	const closeCalendar = () => {
		calendarPopupRef.value?.close()
	}

	const onCalendarPopupChange = (e : { show : boolean }) => {
		if (!e.show) tempDay.value = selectedDay.value
	}

	const selectDay = (day : { value : number; muted ?: boolean }) => {
		if (day.muted) return
		tempDay.value = day.value
	}

	const confirmCalendar = () => {
		if (tempDay.value) {
			selectedDay.value = tempDay.value
			// 日期变更后重新初始化可用时间
			nextTick(() => initializeReservationTime())
		}
		closeCalendar()
	}

	const prevMonth = () => {
		if (month.value === 1) {
			month.value = 12
			year.value -= 1
		} else {
			month.value -= 1
		}
	}

	const nextMonth = () => {
		if (month.value === 12) {
			month.value = 1
			year.value += 1
		} else {
			month.value += 1
		}
	}

	const openTimePicker = (target : 'start' | 'end') => {
		timePickerTarget.value = target
		const current = target === 'start' ? startTime.value : endTime.value
		const { hourIndex, minuteIndex } = parseTime(current)
		pickerIndex.value = [hourIndex, minuteIndex]
		tempTime.value = formatTime(hourIndex, minuteIndex)
		timePopupRef.value?.open()
	}

	const closeTimePicker = () => {
		timePopupRef.value?.close()
	}

	const onTimePopupChange = () => { }

	const onPickerChange = async (e : { detail : { value : number[] } }) => {
		const [hourIndex, minuteIndex] = e.detail.value
		// 先更新小时，触发 minuteOptions 重算
		pickerIndex.value = [hourIndex, pickerIndex.value[1]]
		// 等 minuteOptions computed 更新后，再把 minuteIndex 限制在新列表范围内
		await nextTick()
		const safeMinuteIndex = Math.min(minuteIndex, Math.max(0, minuteOptions.value.length - 1))
		pickerIndex.value = [hourIndex, safeMinuteIndex]
		tempTime.value = formatTime(hourIndex, safeMinuteIndex)
	}

	const confirmTimePicker = () => {
		const time = formatTime(pickerIndex.value[0], pickerIndex.value[1])
		if (timePickerTarget.value === 'start') {
			startTime.value = time
			// 确保结束时间至少比开始时间多15分钟，且不超过 closeTime
			const startMinutes = timeToMinutes(startTime.value)
			const closeMinutes = timeToMinutes(closeTime.value)
			const minEndMinutes = startMinutes + 15
			// 调整为15分钟的倍数
			const adjustedEndMinutes = Math.ceil(minEndMinutes / 15) * 15
			const actualEndMinutes = Math.min(adjustedEndMinutes, closeMinutes)
			if (timeToMinutes(endTime.value) <= startMinutes || timeToMinutes(endTime.value) > closeMinutes) {
				endTime.value = minutesToTime(actualEndMinutes)
			}
		} else {
			// 确保结束时间不超过 closeTime，且至少比开始时间多15分钟
			const selectedMinutes = timeToMinutes(time)
			const startMinutes = timeToMinutes(startTime.value)
			const closeMinutes = timeToMinutes(closeTime.value)
			const minEndMinutes = startMinutes + 15
			// 调整为15分钟的倍数
			const adjustedEndMinutes = Math.ceil(minEndMinutes / 15) * 15
			
			if (selectedMinutes > closeMinutes) {
				endTime.value = closeTime.value
			} else if (selectedMinutes < minEndMinutes) {
				endTime.value = minutesToTime(adjustedEndMinutes)
			} else {
				// 确保选择的结束时间是15分钟的倍数
				const adjustedSelectedMinutes = Math.ceil(selectedMinutes / 15) * 15
				if (adjustedSelectedMinutes <= closeMinutes && adjustedSelectedMinutes >= minEndMinutes) {
					endTime.value = minutesToTime(adjustedSelectedMinutes)
				} else {
					endTime.value = minutesToTime(Math.min(adjustedEndMinutes, closeMinutes))
				}
			}
		}
		closeTimePicker()
	}

	const bookingLoading = ref(false)

	const onRefresh = async () => {
		await Promise.all([
			fetchPayNotice(),
			checkUnpaid().catch(e => console.error('刷新检查待支付订单失败:', e))
		])
		initializeReservationTime()
	}

	const confirmBooking = async () => {
		if (hasUnpaid.value) {
			showUnpaidNotice()
			return
		}
		if (!selectedDay.value) {
			uni.showToast({ title: t('seat.selectDatePlaceholder'), icon: 'none' })
			return
		}
		if (isFull.value) {
			uni.showModal({
				title: t('seat.statusFullTitle'),
				content: t('seat.statusFullDesc'),
				showCancel: false,
				confirmText: t('seat.changeTimeSlot')
			})
			return
		}
		if (bookingLoading.value) return
		bookingLoading.value = true

		uni.showLoading({ title: t('common.loading') || '処理中...', mask: true })

		try {
			const response = await api.PostReservationOrderCreate(
				venueId.value,
				dateStr.value,
				startTime.value,
				endTime.value
			) as any

			uni.hideLoading()

			if (response && response.code === 1) {
				// 创建成功，跳转订单详情
				const orderId = response.data?.id || response.data?.order_id || ''
				uni.navigateTo({
					url: `/pages/order/detail?orderId=${orderId}`
				})
			} else if (response && response.code === 1006) {
				// 理论上不会走到这里（拦截器已将非code=1的响应reject到catch）
				// 保留作为防御性兜底
				activeOrderMsg.value = response.msg || ''
				activeOrderId.value = String(response.data?.id || response.data?.order_id || '')
				activeOrderPopupRef.value?.open()
			} else if (response && response.code === 1002) {
				// 时间段不可预约，显示可用时段
				const availableRanges: Array<{ start_time: string; end_time: string }> = response.data?.available_ranges || []
				const hasAvailable: boolean = response.data?.has_available || false

				if (hasAvailable && availableRanges.length > 0) {
					const rangeText = availableRanges.map((r: { start_time: string; end_time: string }) => `${r.start_time}-${r.end_time}`).join('、')
					uni.showModal({
						title: t('seat.timeUnavailableTitle') || '予約できません',
						content: `${t('seat.availableRanges') || '予約可能時間帯'}：${rangeText}`,
						showCancel: false,
						confirmText: t('common.confirm') || '確定'
					})
				} else {
					uni.showToast({
						title: response.msg || t('seat.timeUnavailable') || 'この時間帯は予約できません',
						icon: 'none',
						duration: 3000
					})
				}
			} else {
				// 其他错误：如果响应里带有 orderId，说明是进行中订单的提示，用弹窗
				// 否则用 toast 显示普通错误信息
				const errOrderId = String(response?.data?.id || response?.data?.order_id || '')
				if (errOrderId) {
					activeOrderMsg.value = response?.msg || t('seat.activeOrderDesc')
					activeOrderId.value = errOrderId
					activeOrderPopupRef.value?.open()
				} else {
					uni.showToast({
						title: response?.msg || t('common.requestFailed') || 'エラーが発生しました',
						icon: 'none',
						duration: 3000
					})
				}
			}
		} catch (error: any) {
			uni.hideLoading()
			console.error('创建预约失败 error对象:', JSON.stringify(error))

			const code = error?.code
			const msg = error?.msg || error?.message || ''
			const errOrderId = String(error?.data?.id || error?.data?.order_id || '')

			if (code === 1006 || errOrderId) {
				// 后端返回进行中订单（code 1006 或带有 orderId）
				activeOrderMsg.value = msg || t('seat.activeOrderDesc')
				activeOrderId.value = errOrderId
				activeOrderPopupRef.value?.open()
			} else if (msg) {
				uni.showToast({ title: msg, icon: 'none', duration: 3000 })
			}
		} finally {
			bookingLoading.value = false
		}
	}
</script>

<style lang="scss" scoped>
	.seat-page {
		min-height: 100vh;
		background: #F8F9FF;
		padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
	}

	.seat-body {
		height: calc(100vh - 120rpx - 140rpx - env(safe-area-inset-top) - env(safe-area-inset-bottom));
	}

	.seat-hero {
		position: relative;
		height: 240rpx;
		margin: 32rpx 32rpx 0;
		border-radius: 24rpx;
		overflow: hidden;
	}

	.seat-hero__image {
		width: 100%;
		height: 100%;
	}

	.seat-hero__gradient {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(11, 28, 48, 0.05) 0%, rgba(11, 28, 48, 0.45) 100%);
	}

	.seat-hero__title {
		position: absolute;
		left: 32rpx;
		bottom: 28rpx;
		font-size: 48rpx;
		font-weight: 400;
		color: #0B1C30;
		line-height: 1.4;
	}

	.seat-section {
		padding: 40rpx 32rpx 0;
	}

	.seat-section--time {
		padding-top: 32rpx;
	}

	.seat-section__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16rpx;
	}

	.seat-section__label {
		display: flex;
		align-items: center;
		gap: 8rpx;
		font-size: 28rpx;
		font-weight: 500;
		color: #424754;
	}

	.seat-section__bar {
		width: 5rpx;
		height: 26rpx;
		border-radius: 4rpx;
		background: #3B82F6;
		flex-shrink: 0;
	}

	.seat-section__meta {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.seat-section__month {
		font-size: 24rpx;
		font-weight: 500;
		color: #0058BE;
	}

	.seat-section__calendar-icon {
		width: 36rpx;
		height: 36rpx;
	}

	.seat-field {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 48rpx;
		background: #fff;
		border: 1rpx solid #C2C6D6;
		border-radius: 24rpx;
	}

	.seat-field--time {
		padding: 32rpx 40rpx;
	}

	.seat-field__text {
		font-size: 32rpx;
		color: #424754;
		line-height: 1.4;

		&--placeholder {
			color: #949494;
		}
	}

	.seat-field__clock {
		width: 36rpx;
		height: 36rpx;
		flex-shrink: 0;
	}

	.seat-time-row {
		display: flex;
		gap: 32rpx;
		margin-top: 16rpx;
	}

	.seat-time-col {
		flex: 1;
		min-width: 0;
	}

	.seat-time-col__label {
		display: block;
		font-size: 28rpx;
		color: #424754;
		margin-bottom: 16rpx;
		line-height: 1.2;
	}

	.status-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 32rpx 32rpx 0;
		padding: 48rpx;
		background: #D7E4F4;
		border: 1rpx solid rgba(0, 88, 190, 0.2);
		border-radius: 24rpx;
	}

	.status-card__left {
		flex: 1;
		min-width: 0;
	}

	.status-card__status-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 8rpx;
	}

	.status-card__dot {
		width: 16rpx;
		height: 16rpx;
		border-radius: 9999rpx;
		background: #006947;
		flex-shrink: 0;

		&--full {
			background: #D40000;
		}
	}

	.status-card__status {
		font-size: 28rpx;
		font-weight: 500;
		color: #0B1C30;
		line-height: 1.4;
	}

	.status-card__sub {
		display: block;
		padding-left: 28rpx;
		font-size: 24rpx;
		color: #949494;
		line-height: 1.4;
	}

	.status-card__right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		flex-shrink: 0;
		margin-left: 24rpx;
	}

	.status-card__seats-label {
		font-size: 24rpx;
		font-weight: 500;
		color: #424754;
		margin-bottom: 4rpx;
	}

	.status-card__seats-count {
		font-size: 48rpx;
		font-weight: 700;
		color: #006947;
		line-height: 1.4;

		&--full {
			color: #D40000;
		}
	}

	.precautions {
		padding: 48rpx 32rpx 32rpx;
	}

	.precautions__title {
		display: block;
		font-size: 32rpx;
		font-weight: 500;
		color: #424754;
		letter-spacing: 0.05em;
		margin-bottom: 24rpx;
	}

	.precautions__box {
		background: #fff;
		border: 2rpx dashed rgba(0, 88, 190, 0.28);
		border-radius: 24rpx;
		padding: 48rpx;
		display: flex;
		flex-direction: column;
		gap: 32rpx;
	}

	.precautions__item {
		display: flex;
		align-items: flex-start;
		align-items: center;
		gap: 24rpx;
	}

	.precautions__icon {
		width: 40rpx;
		height: 40rpx;
		flex-shrink: 0;
		margin-top: 2rpx;
	}

	.precautions__text {
		flex: 1;
		font-size: 28rpx;
		font-weight: 500;
		color: #0B1C30;
		line-height: 1.4;
		white-space: normal !important;
		word-wrap: break-word !important;
	}

	.unpaid-notice {
		width: 620rpx;
		background: #F8F9FF;
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 50rpx 100rpx -24rpx rgba(0, 0, 0, 0.25);
	}

	.unpaid-notice__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		background: #EFF4FF;
		margin: 48rpx auto 0;
	}

	.unpaid-notice__body {
		padding: 24rpx 48rpx 48rpx;
	}

	.unpaid-notice__title {
		display: block;
		font-size: 48rpx;
		font-weight: 500;
		color: #0B1C30;
		margin-bottom: 16rpx;
		line-height: 1.4;
	}

	.unpaid-notice__desc {
		display: block;
		font-size: 32rpx;
		color: #424754;
		line-height: 1.6;
	}

	.unpaid-notice__actions {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
		padding: 0 48rpx 48rpx;
	}

	.unpaid-notice__btn {
		height: 88rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		text {
			font-size: 28rpx;
			font-weight: 500;
		}

		&--primary {
			background: #0058BE;

			text {
				color: #fff;
			}
		}

		&--ghost {
			background: transparent;

			text {
				color: #0058BE;
			}
		}
	}

	/* Figma 座位预约-日期: modal 358×auto, radius 24px */
	.calendar-popup {
		width: 716rpx;
		background: #fff;
		border-radius: 48rpx;
		overflow: hidden;
		box-shadow: 0 50rpx 100rpx -24rpx rgba(0, 0, 0, 0.25);
	}

	.calendar-popup__header {
		padding: 40rpx 48rpx 32rpx;
		background: #fff;
		border-bottom: 1rpx solid #E2E8F0;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.calendar-popup__nav {
		width: 64rpx;
		height: 64rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: #F8F9FF;
		cursor: pointer;
		transition: background 0.2s ease;

		&:active {
			background: #E8EEF7;
		}
	}

	.calendar-popup__nav-icon {
		font-size: 48rpx;
		font-weight: 300;
		color: #0058BE;
		line-height: 1;
	}

	.calendar-popup__title {
		display: block;
		font-size: 36rpx;
		font-weight: 500;
		color: #0B1C30;
		line-height: 1.4;
	}

	.calendar-popup__hint {
		display: block;
		font-size: 24rpx;
		color: #424754;
		line-height: 1.4;
	}

	.calendar-popup__body {
		padding: 32rpx 48rpx 40rpx;
		background: #fff;
	}

	.calendar-popup__month {
		display: block;
		font-size: 32rpx;
		font-weight: 500;
		color: #0B1C30;
		line-height: 1.4;
		text-align: center;
		margin-bottom: 24rpx;
	}

	.calendar-popup__weekdays {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		text-align: center;
		margin-bottom: 8rpx;
	}

	.calendar-popup__weekday {
		font-size: 24rpx;
		font-weight: 400;
		color: #424754;
		line-height: 1.4;

		&--sun {
			color: #D40000;
		}
	}

	.calendar-popup__days {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
	}

	.calendar-popup__day {
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 16rpx;

		text {
			font-size: 28rpx;
			font-weight: 400;
			color: #0B1C30;
			line-height: 1;
		}

		&--muted {
			pointer-events: none;

			text {
				color: #C2C6D6;
			}
		}

		&--selected {
			background: #0058BE;

			text {
				color: #fff !important;
				font-weight: 500;
			}
		}

		&--today {

			// 今日默认文字蓝色，无背景
			text {
				color: #0058BE;
				font-weight: 500;
			}
		}

		// 只有 当前没有任何选中项 时，今日才展示背景（初始打开日历场景）
		&--today.no-selected {
			background: #0058BE;

			text {
				color: #fff;
			}
		}
	}

	.calendar-popup__footer {
		display: flex;
		gap: 24rpx;
		padding: 32rpx 48rpx;
		background: #EFF4FF;
		border-top: 1rpx solid #E2E8F0;
	}

	.calendar-popup__btn {
		flex: 1;
		height: 88rpx;
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		text {
			font-size: 28rpx;
			font-weight: 500;
			line-height: 1.4;
		}

		&--ghost {
			border: 1rpx solid #C2C6D6;
			background: #fff;

			text {
				color: #424754;
			}
		}

		&--primary {
			background: #0058BE;

			text {
				color: #fff;
			}
		}
	}

	/* Figma 座位预约-时间: Background 390×auto, radius 12px top */
	.time-popup {
		background: #fff;
		border-radius: 24rpx 24rpx 0 0;
		padding-bottom: env(safe-area-inset-bottom);
	}

	.time-popup__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 88rpx;
		padding: 0 32rpx;
		border-bottom: 1rpx solid #E2E8F0;
	}

	.time-popup__cancel,
	.time-popup__confirm {
		font-size: 34rpx;
		font-weight: 400;
		color: #0058BE;
		line-height: 1.4;
		min-width: 112rpx;
	}

	.time-popup__cancel {
		text-align: left;
	}

	.time-popup__confirm {
		text-align: right;
	}

	.time-popup__title {
		flex: 1;
		font-size: 34rpx;
		font-weight: 500;
		color: #0B1C30;
		line-height: 1.4;
		text-align: center;
	}

	.time-popup__picker-wrap {
		padding-bottom: 16rpx;
	}

	.time-popup__picker-inner {
		position: relative;
	}

	.time-popup__selection-band {
		position: absolute;
		left: 0;
		right: 0;
		top: 50%;
		transform: translateY(-50%);
		height: 88rpx;
		background: #EFF4FF;
		border-top: 1rpx solid #E2E8F0;
		border-bottom: 1rpx solid #E2E8F0;
		z-index: 0;
		pointer-events: none;
	}

	.time-popup__picker {
		position: relative;
		z-index: 1;
		height: 440rpx;
	}

	:deep(.uni-picker-view-indicator),
	:deep(.picker-view-indicator) {
		background: transparent !important;
		background-color: transparent !important;
		border: none !important;
	}

	:deep(.uni-picker-view-mask) {
		background-image: none !important;
	}

	.time-popup__colon-wrap {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		z-index: 2;
		pointer-events: none;
	}

	.time-popup__colon {
		font-size: 40rpx;
		font-weight: 600;
		color: #0058BE;
		line-height: 1;
	}

	.time-popup__picker-item {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 88rpx;

		&--hour {
			justify-content: flex-end;
			padding-right: 40rpx;
		}

		&--minute {
			justify-content: flex-start;
			padding-left: 40rpx;
		}
	}
</style>