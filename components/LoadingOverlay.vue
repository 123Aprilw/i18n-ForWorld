<template>
	<view v-if="visible" class="loading-overlay">
		<view class="loading-box">
			<view class="loading-spinner">
				<view class="loading-spinner__ring" />
				<view class="loading-spinner__ring loading-spinner__ring--2" />
				<view class="loading-spinner__dot" />
			</view>
			<text v-if="message" class="loading-box__text">{{ message }}</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { useLoading } from '@/composables/useLoading'

const { visible, message } = useLoading()
</script>

<style lang="scss" scoped>
.loading-overlay {
	position: fixed;
	top: 0;
	bottom: 0;
	left: var(--app-left, 0);
	right: var(--app-right, 0);
	z-index: 99999;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(11, 28, 48, 0.45);
	backdrop-filter: blur(6rpx);
}

.loading-box {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 28rpx;
	padding: 56rpx 72rpx;
	background: #FFFFFF;
	border-radius: 32rpx;
	box-shadow: 0 24rpx 80rpx rgba(0, 88, 190, 0.18);
	min-width: 240rpx;
}

.loading-spinner {
	position: relative;
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.loading-spinner__ring {
	position: absolute;
	inset: 0;
	border-radius: 50%;
	border: 6rpx solid transparent;
	border-top-color: #0058BE;
	animation: spin 0.9s linear infinite;
}

.loading-spinner__ring--2 {
	inset: 12rpx;
	border-top-color: rgba(0, 88, 190, 0.3);
	animation-duration: 1.3s;
	animation-direction: reverse;
}

.loading-spinner__dot {
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	background: #0058BE;
}

.loading-box__text {
	font-size: 28rpx;
	font-weight: 500;
	color: #0B1C30;
	line-height: 1.4;
	text-align: center;
	white-space: normal !important;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}
</style>
