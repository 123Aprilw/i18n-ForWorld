<template>
	<view class="content">
		<view class="text-area">
			<uv-button type="primary" text="确定"></uv-button>
			<uv-avatar src="/static/login.png" shape='circle' size='40' @click="clickAvator"></uv-avatar>
			<uv-button :custom-style="customStyle"></uv-button>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed } from 'vue'
	const clickAvator = () => {
		console.log(666)
	}
	const customStyle = computed(() => {
		return {
			height: "50rpx",
			width: "50rpx",
			background: 'blue',
			borderRadius:'50%'
		}
	})
</script>

<style lang="scss">
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>