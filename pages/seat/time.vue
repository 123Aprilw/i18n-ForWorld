<template>
	<view class="time-page">
		<PageHeader :title="t('seat.timeTitle')" show-lang glass />
		<view class="time-page__body">
			<view v-for="group in timeGroups" :key="group.key" class="time-group">
				<text class="time-group__title">{{ t(group.key) }}</text>
				<view class="time-slots">
					<view
						v-for="slot in group.slots"
						:key="slot"
						class="time-slot"
						:class="{ selected: selectedTime === slot, disabled: isDisabled(slot) }"
						@click="selectTime(slot)"
					>
						<text>{{ slot }}</text>
					</view>
				</view>
			</view>
		</view>
		<BottomActionBar :text="t('common.confirm')" @click="goBooking" />
		<LanguagePopupHost />
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useLocale } from '@/composables/useLocale'
import PageHeader from '@/components/PageHeader.vue'
import BottomActionBar from '@/components/BottomActionBar.vue'
import LanguagePopupHost from '@/components/LanguagePopupHost.vue'

const { t } = useLocale()
const venueId = ref('1')
const date = ref('')
const spaceType = ref('')
const selectedTime = ref('10:00-12:00')

onLoad((query) => {
	const venue = query?.venueId ? `venueId=${query.venueId}` : ''
	const space = query?.space ? `&space=${query.space}` : ''
	uni.redirectTo({ url: `/pages/seat/date?${venue}${space}` })
})

const timeGroups = [
	{ key: 'seat.morning', slots: ['08:00-10:00', '10:00-12:00'] },
	{ key: 'seat.afternoon', slots: ['13:00-15:00', '15:00-17:00'] },
	{ key: 'seat.evening', slots: ['18:00-20:00', '20:00-22:00'] }
]

const disabledSlots = ['08:00-10:00', '15:00-17:00']
const isDisabled = (slot: string) => disabledSlots.includes(slot)
const selectTime = (slot: string) => { if (!isDisabled(slot)) selectedTime.value = slot }

const goBooking = () => {
	const spaceQuery = spaceType.value ? `&space=${spaceType.value}` : ''
	uni.navigateTo({
		url: `/pages/seat/booking?venueId=${venueId.value}&date=${date.value}&time=${selectedTime.value}&status=available${spaceQuery}`
	})
}
</script>

<style lang="scss" scoped>
.time-page {
	min-height: 100vh;
	position: relative;
	background: #FFFFFF;
	padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}
.time-page__body { padding: 32rpx; }
.time-group { margin-bottom: 40rpx; }
.time-group__title {
	display: block;
	font-size: 28rpx;
	font-weight: 500;
	color: #0B1C30;
	margin-bottom: 20rpx;
}
.time-slots {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20rpx;
}
.time-slot {
	border: 1rpx solid #C2C6D6;
	border-radius: 16rpx;
	padding: 28rpx;
	text-align: center;
	background: #fff;
	text { font-size: 28rpx; color: #424754; }
	&.selected {
		border-color: #0058BE;
		background: #EFF4FF;
		text { color: #0058BE; font-weight: 500; }
	}
	&.disabled {
		background: #f5f5f5;
		text { color: #C2C6D6; }
	}
}
</style>
