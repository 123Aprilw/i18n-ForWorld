<template>
	<view class="seat-page">
		<PageHeader :title="t('seat.title')" show-lang glass />
		<scroll-view scroll-y class="seat-body">
			<view class="seat-hero">
				<image class="seat-hero__image" src="/static/images/venues/hero-1.png" mode="aspectFill" />
				<view class="seat-hero__gradient" />
				<text class="seat-hero__title">{{ t('seat.heroTitle') }}</text>
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
						<text class="status-card__status">{{ isFull ? t('seat.statusFull') : t('seat.statusAvailable') }}</text>
					</view>
					<text class="status-card__sub">
						{{ isFull ? otherTimesText : selectedRangeText }}
					</text>
				</view>
				<view class="status-card__right">
					<text class="status-card__seats-label">{{ t('seat.remainingSeats') }}</text>
					<text class="status-card__seats-count" :class="{ 'status-card__seats-count--full': isFull }">
						{{ isFull ? '0' : '22' }}
					</text>
				</view>
			</view>

			<view class="precautions">
				<text class="precautions__title">{{ t('seat.precautionsTitle') }}</text>
				<view class="precautions__box">
					<view v-for="item in precautions" :key="item.key" class="precautions__item">
						<image class="precautions__icon" :src="item.icon" mode="aspectFit" />
						<text class="precautions__text">{{ t(item.key) }}</text>
					</view>
				</view>
			</view>
		</scroll-view>

		<BottomActionBar :text="t('common.confirmBooking')" @click="confirmBooking" />

		<uv-popup
			ref="unpaidPopupRef"
			mode="center"
			round="12"
			:z-index="10080"
			:overlay-opacity="0.6"
			:close-on-click-overlay="false"
		>
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

		<uv-popup
			ref="calendarPopupRef"
			mode="center"
			round="24"
			:z-index="10075"
			:overlay-opacity="0.6"
			:close-on-click-overlay="true"
			@change="onCalendarPopupChange"
		>
			<view class="calendar-popup">
				<view class="calendar-popup__header">
					<text class="calendar-popup__title">{{ monthLabel }}</text>
					<text class="calendar-popup__hint">{{ t('seat.calendarHint') }}</text>
				</view>
				<view class="calendar-popup__body">
					<text class="calendar-popup__month">{{ monthLabel }}</text>
					<view class="calendar-popup__weekdays">
						<text
							v-for="(d, wi) in weekdays"
							:key="d"
							class="calendar-popup__weekday"
							:class="{ 'calendar-popup__weekday--sun': wi === 0 }"
						>{{ d }}</text>
					</view>
					<view class="calendar-popup__days">
						<view
							v-for="(day, i) in days"
							:key="i"
							class="calendar-popup__day"
							:class="{
								'calendar-popup__day--muted': day && day.muted,
								'calendar-popup__day--selected': day && !day.muted && day.value === tempDay
							}"
							@click="selectDay(day)"
						>
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

		<uv-popup
			ref="timePopupRef"
			mode="bottom"
			round="24"
			:z-index="10076"
			:overlay-opacity="0.6"
			:close-on-click-overlay="true"
			@change="onTimePopupChange"
		>
			<view class="time-popup">
				<view class="time-popup__header">
					<text class="time-popup__cancel" @click="closeTimePicker">{{ t('common.cancel') }}</text>
					<text class="time-popup__title">{{ t('seat.selectTimeTitle') }}</text>
					<text class="time-popup__confirm" @click="confirmTimePicker">{{ t('seat.confirmTime') }}</text>
				</view>
				<view class="time-popup__picker-wrap">
					<view class="time-popup__picker-inner">
						<view class="time-popup__selection-band" />
						<picker-view
							class="time-popup__picker"
							:value="pickerIndex"
							indicator-style="height: 88rpx; background: rgba(0,0,0,0); border: none;"
							immediate-change
							@change="onPickerChange"
						>
							<picker-view-column>
								<view
									v-for="(hour, i) in hourOptions"
									:key="hour"
									class="time-popup__picker-item time-popup__picker-item--hour"
									:style="getHourTextStyle(i)"
								>
									{{ hour }}
								</view>
							</picker-view-column>
							<picker-view-column>
								<view
									v-for="(minute, i) in minuteOptions"
									:key="minute"
									class="time-popup__picker-item time-popup__picker-item--minute"
									:style="getMinuteTextStyle(i)"
								>
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
import { ref, computed, nextTick } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useLocale } from '@/composables/useLocale'
import { icons } from '@/utils/icons'
import { orders } from '@/utils/mock'
import PageHeader from '@/components/PageHeader.vue'
import BottomActionBar from '@/components/BottomActionBar.vue'
import LanguagePopupHost from '@/components/LanguagePopupHost.vue'

const { t, locale } = useLocale()
const venueId = ref('1')
const spaceType = ref('')
const today = new Date()
const year = ref(today.getFullYear())
const month = ref(today.getMonth() + 1)
const selectedDay = ref<number | null>(null)
const tempDay = ref<number | null>(null)
const startTime = ref('09:00')
const endTime = ref('10:00')
const timePickerTarget = ref<'start' | 'end'>('start')
const pickerIndex = ref([1, 0])
const tempTime = ref('09:00')

const hourOptions = Array.from({ length: 15 }, (_, i) => String(8 + i).padStart(2, '0'))
const minuteOptions = ['00', '15', '30', '45']

const timeToMinutes = (time: string) => {
	const [h, m] = time.split(':').map(Number)
	return h * 60 + m
}

const minutesToTime = (total: number) => {
	const h = Math.floor(total / 60)
	const m = total % 60
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const parseTime = (time: string) => {
	const [h, m] = time.split(':')
	const hourIndex = Math.max(0, hourOptions.indexOf(h))
	const minuteIndex = Math.max(0, minuteOptions.indexOf(m))
	return { hourIndex, minuteIndex }
}

const formatTime = (hourIndex: number, minuteIndex: number) =>
	`${hourOptions[hourIndex]}:${minuteOptions[minuteIndex]}`

const getHourTextStyle = (index: number) => {
	const active = pickerIndex.value[0] === index
	return {
		color: active ? '#424754' : '#C2C6D6',
		fontSize: '40rpx',
		fontWeight: '400'
	}
}

const getMinuteTextStyle = (index: number) => {
	const active = pickerIndex.value[1] === index
	return {
		color: active ? '#0058BE' : '#C2C6D6',
		fontSize: '40rpx',
		fontWeight: active ? '600' : '400'
	}
}

const calendarPopupRef = ref<{ open: () => void; close: () => void } | null>(null)
const timePopupRef = ref<{ open: () => void; close: () => void } | null>(null)
const unpaidPopupRef = ref<{ open: () => void; close: () => void } | null>(null)

const hasUnpaid = computed(() => orders.some(o => o.status === 'pending'))

const precautions = [
	{ key: 'seat.precaution1', icon: icons.seat.precaution1 },
	{ key: 'seat.precaution2', icon: icons.seat.precaution2 },
	{ key: 'seat.precaution3', icon: icons.seat.precaution3 },
	{ key: 'seat.precaution4', icon: icons.seat.precaution4 },
	{ key: 'seat.precaution5', icon: icons.seat.precaution5 },
	{ key: 'seat.precaution6', icon: icons.seat.precaution6 },
	{ key: 'seat.precaution7', icon: icons.seat.precaution7 },
	{ key: 'seat.precaution8', icon: icons.seat.precaution8 }
]

onLoad((query) => {
	if (query?.venueId) venueId.value = query.venueId as string
	if (query?.space) spaceType.value = query.space as string
})

onShow(() => {
	if (hasUnpaid.value) {
		nextTick(() => unpaidPopupRef.value?.open())
	}
})

const showUnpaidNotice = () => {
	unpaidPopupRef.value?.open()
}

const closeUnpaidNotice = () => {
	unpaidPopupRef.value?.close()
}

const goPay = () => {
	closeUnpaidNotice()
	uni.navigateTo({ url: '/pages/order/detail?type=pendingPayment' })
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
	const start = startTime.value
	return start >= '14:00' && start < '17:00'
})

const selectedRangeText = computed(() =>
	t('seat.selectedTimeRange').replace('{range}', timeRange.value)
)

const otherTimesText = computed(() =>
	t('seat.otherAvailableTimes').replace('{times}', '09:00-10:00 10:00-12:00')
)

const days = computed(() => {
	const firstDay = new Date(year.value, month.value - 1, 1).getDay()
	const total = new Date(year.value, month.value, 0).getDate()
	const prevTotal = new Date(year.value, month.value - 1, 0).getDate()
	const result: Array<{ value: number; muted?: boolean }> = []

	for (let i = firstDay - 1; i >= 0; i--) {
		result.push({ value: prevTotal - i, muted: true })
	}
	for (let i = 1; i <= total; i++) {
		result.push({ value: i })
	}
	while (result.length % 7 !== 0) {
		const next = result.length - firstDay - total + 1
		result.push({ value: next, muted: true })
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

const onCalendarPopupChange = (e: { show: boolean }) => {
	if (!e.show) tempDay.value = selectedDay.value
}

const selectDay = (day: { value: number; muted?: boolean }) => {
	if (day.muted) return
	tempDay.value = day.value
}

const confirmCalendar = () => {
	if (tempDay.value) selectedDay.value = tempDay.value
	closeCalendar()
}

const openTimePicker = (target: 'start' | 'end') => {
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

const onTimePopupChange = () => {}

const onPickerChange = (e: { detail: { value: number[] } }) => {
	const [hourIndex, minuteIndex] = e.detail.value
	pickerIndex.value = [hourIndex, minuteIndex]
	tempTime.value = formatTime(hourIndex, minuteIndex)
}

const confirmTimePicker = () => {
	const time = formatTime(pickerIndex.value[0], pickerIndex.value[1])
	if (timePickerTarget.value === 'start') {
		startTime.value = time
		if (timeToMinutes(endTime.value) <= timeToMinutes(startTime.value)) {
			const nextMinutes = Math.min(timeToMinutes(startTime.value) + 15, 22 * 60)
			endTime.value = minutesToTime(nextMinutes)
		}
	} else {
		endTime.value = time
	}
	closeTimePicker()
}

const confirmBooking = () => {
	if (hasUnpaid.value) {
		showUnpaidNotice()
		return
	}
	if (!selectedDay.value) {
		uni.showToast({ title: t('seat.selectDatePlaceholder'), icon: 'none' })
		return
	}
	if (isFull.value) {
		uni.showToast({ title: t('seat.statusFull'), icon: 'none' })
		return
	}
	const spaceQuery = spaceType.value ? `&space=${spaceType.value}` : ''
	uni.navigateTo({
		url: `/pages/order/detail?type=reserved&venueId=${venueId.value}&date=${dateStr.value}&time=${timeRange.value}${spaceQuery}`
	})
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
	width: 36rpx;
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
}

.unpaid-notice {
	width: 620rpx;
	background: #F8F9FF;
	border-radius: 24rpx;
	overflow: hidden;
	box-shadow: 0 50rpx 100rpx -24rpx rgba(0, 0, 0, 0.25);
}

.unpaid-notice__body {
	padding: 48rpx;
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
	white-space: pre-line;
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
}

.calendar-popup__title {
	display: block;
	font-size: 36rpx;
	font-weight: 500;
	color: #0B1C30;
	line-height: 1.4;
	margin-bottom: 8rpx;
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
			color: #fff;
			font-weight: 500;
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
