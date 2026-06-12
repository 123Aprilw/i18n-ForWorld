<template>
	<view class="page-header" :class="{ 'page-header--glass': glass, 'page-header--flat': hideBorder }" :style="headerStyle">
		<view class="page-header__left" @click="goBack">
			<uv-icon name="arrow-left" size="20" :color="backColor"></uv-icon>
		</view>
		<text v-if="!hideTitle" class="page-header__title">{{ title }}</text>
		<view v-else class="page-header__title" />
		<view class="page-header__right">
			<LanguageSwitcher v-if="showLang" />
			<slot name="right"></slot>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const props = withDefaults(defineProps<{
	title?: string
	showLang?: boolean
	glass?: boolean
	background?: string
	hideTitle?: boolean
	hideBorder?: boolean
	backColor?: string
}>(), {
	backColor: '#0B1C30'
})

const headerStyle = computed(() =>
	props.background ? { background: props.background } : undefined
)

const goBack = () => {
	uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/home/home' }) })
}
</script>

<style lang="scss" scoped>
.page-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 32rpx;
	padding-top: calc(24rpx + env(safe-area-inset-top));
	background: rgba(255, 255, 255, 0.85);
	border-bottom: 1rpx solid #C2C6D6;
	&--glass {
		background: rgba(255, 255, 255, 0.95);
	}
	&--flat {
		border-bottom: none;
	}
}
.page-header__left {
	width: 72rpx;
	height: 72rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 9999rpx;
}
.page-header__title {
	flex: 1;
	text-align: center;
	font-size: 32rpx;
	font-weight: 500;
	color: #0B1C30;
}
.page-header__right {
	min-width: 72rpx;
	display: flex;
	justify-content: flex-end;
}
</style>
