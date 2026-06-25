<template>
	<view class="lang-btn" @click.stop="openLanguagePopup">
		<uv-icon :name="icons.world" size="15"></uv-icon>
		<text class="lang-text">{{ locale === 'jp' ? 'JP / EN' : 'EN / JP' }}</text>
	</view>
</template>

<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import { useLanguagePopup } from '@/composables/useLanguagePopup'
import { icons } from '@/utils/icons'

const { locale } = useLocale()
const { openLanguagePopup } = useLanguagePopup()
</script>

<style lang="scss" scoped>
.lang-btn {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 12rpx 24rpx;
	background: #fff;
	border: 1rpx solid #C2C6D6;
	border-radius: 9999rpx;
}
.lang-text {
	font-size: 24rpx;
	font-weight: 500;
	color: #424754;
	font-family: Inter, sans-serif;
}
</style>
