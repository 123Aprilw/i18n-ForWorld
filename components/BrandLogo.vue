<template>
	<view class="brand-wrap">
		<view class="brand">
			<view class="brand__logo-wrap">
				<image class="brand__logo" :src="icons.logo" mode="aspectFit"></image>
			</view>
			<text class="brand__name">{{ t('brand.name') }}</text>
		</view>
		<text v-if="showTagline" class="brand__tagline">{{ t('brand.tagline') }}</text>
	</view>
</template>

<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import { icons } from '@/utils/icons'

defineProps<{ showTagline?: boolean }>()
const { t } = useLocale()
</script>

<style lang="scss" scoped>
.brand-wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.brand {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 24rpx;
}
.brand__logo-wrap {
	width: 96rpx;
	height: 96rpx;
	background: #fff;
	border-radius: 24rpx;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
	display: flex;
	align-items: center;
	justify-content: center;
}
.brand__logo {
	width: 70rpx;
	height: 74rpx;
}
.brand__name {
	font-size: 48rpx;
	font-weight: 500;
	color: #0058BE;
	font-family: Inter, sans-serif;
	letter-spacing: -0.025em;
}
.brand__tagline {
	display: block;
	text-align: center;
	font-size: 32rpx;
	color: #424754;
	margin-top: 14rpx;
	font-family: 'Noto Sans JP', sans-serif;
}
</style>
