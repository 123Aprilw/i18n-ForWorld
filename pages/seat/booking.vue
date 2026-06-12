<template>
	<view class="booking-page">
		<PageHeader :title="t('seat.title')" show-lang glass />
		<scroll-view scroll-y class="booking-body">
			<view class="booking-hero">
				<view class="booking-hero__overlay"></view>
				<view class="booking-hero__info">
					<text class="booking-hero__date">{{ date }}</text>
					<text class="booking-hero__time">{{ time }}</text>
				</view>
			</view>
			<view class="seat-section">
				<view class="seat-legend">
					<view v-for="item in legend" :key="item.key" class="legend-item">
						<view class="legend-dot" :class="item.type"></view>
						<text>{{ t(item.key) }}</text>
					</view>
				</view>
				<view v-if="status === 'full'" class="full-notice">
					<uv-icon name="info-circle" color="#EF4444" size="20"></uv-icon>
					<text>{{ t('seat.full') }}</text>
				</view>
				<view class="seat-grid">
					<view
						v-for="seat in seats"
						:key="seat.id"
						class="seat-item"
						:class="[seat.status, { selected: selectedSeat === seat.id }]"
						@click="selectSeat(seat)"
					>
						<text>{{ seat.id }}</text>
					</view>
				</view>
			</view>
		</scroll-view>
		<BottomActionBar
			:text="status === 'full' ? t('seat.full') : t('common.confirmBooking')"
			@click="confirmBooking"
		/>
		<LanguagePopupHost />
	</view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useLocale } from '@/composables/useLocale'
import PageHeader from '@/components/PageHeader.vue'
import BottomActionBar from '@/components/BottomActionBar.vue'
import LanguagePopupHost from '@/components/LanguagePopupHost.vue'

const { t } = useLocale()
const venueId = ref('1')
const date = ref('2026-06-15')
const time = ref('10:00-12:00')
const spaceType = ref('')
const status = ref<'available' | 'full'>('available')
const selectedSeat = ref('')

onLoad((query) => {
	const venue = query?.venueId ? `venueId=${query.venueId}` : ''
	const space = query?.space ? `&space=${query.space}` : ''
	uni.redirectTo({ url: `/pages/seat/date?${venue}${space}` })
})

const legend = [
	{ key: 'seat.legendAvailable', type: 'available' },
	{ key: 'seat.legendOccupied', type: 'occupied' },
	{ key: 'seat.legendSelected', type: 'selected' }
]

const seatIds = ['A-01','A-02','A-03','A-04','A-05','A-06','B-01','B-02','B-03','B-04','B-05','B-06','C-01','C-02','C-03','C-04']

const occupiedSet = computed(() =>
	status.value === 'full'
		? new Set(seatIds)
		: new Set(['A-02', 'A-05', 'B-03', 'C-01'])
)

const seats = computed(() =>
	seatIds.map(id => ({
		id,
		status: occupiedSet.value.has(id) ? 'occupied' : 'available'
	}))
)

const selectSeat = (seat: { id: string; status: string }) => {
	if (seat.status === 'occupied' || status.value === 'full') return
	selectedSeat.value = seat.id
}

const confirmBooking = () => {
	if (status.value === 'full') return
	if (!selectedSeat.value) {
		uni.showToast({ title: t('seat.selectSeat'), icon: 'none' })
		return
	}
	const spaceQuery = spaceType.value ? `&space=${spaceType.value}` : ''
	uni.navigateTo({
		url: `/pages/order/detail?type=reserved&venueId=${venueId.value}&date=${date.value}&time=${time.value}&seat=${selectedSeat.value}${spaceQuery}`
	})
}
</script>

<style lang="scss" scoped>
.booking-page {
	min-height: 100vh;
	position: relative;
	background: #FFFFFF;
	padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}
.booking-body {
	height: calc(100vh - 120rpx - 140rpx - env(safe-area-inset-top) - env(safe-area-inset-bottom));
}
.booking-hero {
	height: 240rpx;
	background: linear-gradient(135deg, #0058BE 0%, #3B82F6 100%);
	border-radius: 24rpx;
	margin: 32rpx;
	position: relative;
	overflow: hidden;
}
.booking-hero__overlay {
	position: absolute;
	inset: 0;
	background: rgba(0, 0, 0, 0.3);
}
.booking-hero__info {
	position: absolute;
	bottom: 32rpx;
	left: 32rpx;
}
.booking-hero__date, .booking-hero__time {
	display: block;
	color: #fff;
	font-size: 28rpx;
}
.seat-section { padding: 0 32rpx 32rpx; }
.seat-legend {
	display: flex;
	gap: 32rpx;
	margin-bottom: 32rpx;
}
.legend-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
	font-size: 24rpx;
	color: #424754;
}
.legend-dot {
	width: 24rpx;
	height: 24rpx;
	border-radius: 8rpx;
	&.available { background: #EFF4FF; border: 1rpx solid #C2C6D6; }
	&.occupied { background: #C2C6D6; }
	&.selected { background: #0058BE; }
}
.full-notice {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 24rpx;
	background: #FEF2F2;
	border-radius: 16rpx;
	margin-bottom: 24rpx;
	text { color: #EF4444; font-size: 28rpx; }
}
.seat-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 20rpx;
}
.seat-item {
	aspect-ratio: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1rpx solid #C2C6D6;
	border-radius: 16rpx;
	background: #EFF4FF;
	text { font-size: 24rpx; color: #424754; }
	&.occupied {
		background: #C2C6D6;
		text { color: #727785; }
	}
	&.selected, &.available.selected {
		background: #0058BE;
		border-color: #0058BE;
		text { color: #fff; }
	}
}
</style>
