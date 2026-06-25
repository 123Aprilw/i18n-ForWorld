<template>
	<view class="msg-detail-page">
		<PageHeader :title="t('message.detailTitle')" show-lang background="rgba(248, 249, 255, 0.8)" back-color="#0058BE" />
		<scroll-view scroll-y class="msg-detail-body" :show-scrollbar="false">
			<view class="msg-detail-card">
				<view class="msg-detail-card__header">
					<view class="msg-detail-card__icon">
						<uv-icon name="bell" size="28" color="#fff" />
					</view>
					<view class="msg-detail-card__meta">
						<text class="msg-detail-card__type">{{ t('message.system') }}</text>
						<text class="msg-detail-card__time">{{ data.time }}</text>
					</view>
				</view>
				<text class="msg-detail-card__title">{{ locale === 'en' ? (data.title_en || data.title) : data.title }}</text>
				<text class="msg-detail-card__content">{{ locale === 'en' ? (data.content_en || data.content) : data.content }}</text>
			</view>
		</scroll-view>
		<LanguagePopupHost />
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useLocale } from '@/composables/useLocale'
import PageHeader from '@/components/PageHeader.vue'
import LanguagePopupHost from '@/components/LanguagePopupHost.vue'

const { t, locale } = useLocale()

const data = ref({
	id: 0,
	title: '',
	title_en: '',
	content: '',
	content_en: '',
	time: ''
})

onLoad(() => {
	const cached = uni.getStorageSync('currentNotification')
	if (cached) {
		data.value = cached
	}
})
</script>

<style lang="scss" scoped>
.msg-detail-page {
	min-height: 100vh;
	background: linear-gradient(180deg, #F8F9FF 0%, #FFFFFF 100%);
}

.msg-detail-body {
	height: calc(100vh - 128rpx - env(safe-area-inset-top));
	box-sizing: border-box;
	padding: 32rpx;
}

.msg-detail-card {
	background: #FFFFFF;
	border: 1rpx solid #C2C6D6;
	border-radius: 24rpx;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
	padding: 40rpx;
}

.msg-detail-card__header {
	display: flex;
	align-items: center;
	gap: 20rpx;
	margin-bottom: 32rpx;
}

.msg-detail-card__icon {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	background: #3B82F6;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.msg-detail-card__meta {
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.msg-detail-card__type {
	font-size: 24rpx;
	color: #0058BE;
	font-weight: 500;
}

.msg-detail-card__time {
	font-size: 22rpx;
	color: #727785;
}

.msg-detail-card__title {
	display: block;
	font-size: 34rpx;
	font-weight: 600;
	color: #0B1C30;
	line-height: 1.4;
	margin-bottom: 24rpx;
}

.msg-detail-card__content {
	display: block;
	font-size: 28rpx;
	color: #424754;
	line-height: 1.8;
	white-space: pre-wrap;
}
</style>
