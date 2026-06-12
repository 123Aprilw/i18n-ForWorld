<template>
	<view class="bottom-bar">
		<view class="bottom-bar__btn" @click="$emit('click')">
			<text>{{ text }}</text>
		</view>
	</view>
</template>

<script setup lang="ts">
defineProps<{ text: string }>()
defineEmits<{ click: [] }>()
</script>

<style lang="scss" scoped>
.bottom-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
	background: #fff;
	border-top: 1rpx solid #C2C6D6;
	z-index: 99;
}
.bottom-bar__btn {
	background: #0058BE;
	border-radius: 16rpx;
	padding: 24rpx 48rpx;
	text-align: center;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
	text {
		color: #fff;
		font-size: 28rpx;
		font-weight: 500;
	}
}
</style>
