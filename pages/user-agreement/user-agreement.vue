<template>
	<view class="agreement-page">
		<PageHeader
			show-lang
			hide-title
			hide-border
			back-color="#0058BE"
			background="#F8F9FF"
		/>
		<scroll-view scroll-y class="agreement-body" :show-scrollbar="false">
			<view class="agreement-main">
				<view class="agreement-hero">
					<text class="agreement-hero__title">{{ t('agreement.heroTitle') }}</text>
				</view>

				<view class="agreement-card">
					<view class="agreement-section">
						<view class="agreement-section__head">
							<image class="agreement-section__icon agreement-section__icon--terms" :src="icons.agreement.terms" mode="aspectFit" />
							<text class="agreement-section__title agreement-section__title--single">{{ t('agreement.section1Title') }}</text>
						</view>
						<text class="agreement-section__body">{{ t('agreement.section1Body') }}</text>
					</view>

					<view class="agreement-section">
						<view class="agreement-section__head">
							<image class="agreement-section__icon agreement-section__icon--user" :src="icons.agreement.user" mode="aspectFit" />
							<text class="agreement-section__title agreement-section__title--single">{{ t('agreement.section2Title') }}</text>
						</view>
						<view class="agreement-list">
							<view v-for="item in responsibilities" :key="item.titleKey" class="agreement-list__item">
								<view class="agreement-list__bullet" />
								<view class="agreement-list__content">
									<text class="agreement-list__label">{{ t(item.titleKey) }}：</text>
									<text class="agreement-list__text">{{ t(item.bodyKey) }}</text>
								</view>
							</view>
						</view>
					</view>

					<view class="agreement-section agreement-section--privacy">
						<view class="agreement-section__head agreement-section__head--tall">
							<image class="agreement-section__icon agreement-section__icon--privacy" :src="icons.agreement.privacy" mode="aspectFit" />
							<text class="agreement-section__title">{{ t('agreement.section3Title') }}</text>
						</view>
						<text class="agreement-section__body">{{ t('agreement.section3Body') }}</text>
					</view>

					<view class="agreement-section">
						<view class="agreement-section__head">
							<image class="agreement-section__icon agreement-section__icon--warning" :src="icons.agreement.warning" mode="aspectFit" />
							<text class="agreement-section__title agreement-section__title--single">{{ t('agreement.section4Title') }}</text>
						</view>
						<text class="agreement-section__body">{{ t('agreement.section4Body') }}</text>
					</view>
				</view>
			</view>
		</scroll-view>

		<view class="agreement-footer">
			<view class="agreement-submit" @click="handleAgree">
				<text>{{ t('agreement.submit') }}</text>
			</view>
		</view>

		<LanguagePopupHost />
	</view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { useLocale } from '@/composables/useLocale'
import { icons } from '@/utils/icons'
import PageHeader from '@/components/PageHeader.vue'
import LanguagePopupHost from '@/components/LanguagePopupHost.vue'

const { t } = useLocale()

let openerEventChannel: UniApp.EventChannel | undefined

onLoad(() => {
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1] as UniApp.PageInstance & {
		getOpenerEventChannel?: () => UniApp.EventChannel
	}
	openerEventChannel = currentPage.getOpenerEventChannel?.()
})

const responsibilities = [
	{ titleKey: 'agreement.resp1Title', bodyKey: 'agreement.resp1Body' },
	{ titleKey: 'agreement.resp2Title', bodyKey: 'agreement.resp2Body' },
	{ titleKey: 'agreement.resp3Title', bodyKey: 'agreement.resp3Body' }
]

const handleAgree = () => {
	openerEventChannel?.emit('agree')
	uni.navigateBack({
		fail: () => uni.reLaunch({ url: '/pages/login/login' })
	})
}
</script>

<style lang="scss" scoped>
.agreement-page {
	min-height: 100vh;
	width: 100%;
	overflow-x: hidden;
	background: #F8F9FF;
	box-sizing: border-box;
}

.agreement-body {
	width: 100%;
	height: calc(100vh - 120rpx - 160rpx - env(safe-area-inset-top) - env(safe-area-inset-bottom));
	box-sizing: border-box;
}

.agreement-main {
	width: 100%;
	padding: 24rpx 32rpx 32rpx;
	box-sizing: border-box;
}

.agreement-hero {
	width: 100%;
	background: #fff;
	border-radius: 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	padding: 32rpx 40rpx;
	margin-bottom: 24rpx;
	box-sizing: border-box;
}

.agreement-hero__title {
	display: block;
	font-size: 48rpx;
	font-weight: 500;
	color: #0058BE;
	line-height: 1.35;
	word-break: break-word;
}

.agreement-card {
	width: 100%;
	background: #fff;
	border-radius: 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	padding: 40rpx 32rpx;
	box-sizing: border-box;
}

.agreement-section {
	margin-bottom: 48rpx;

	&:last-child {
		margin-bottom: 0;
	}

	&--privacy {
		background: #EFF4FF;
		border-radius: 16rpx;
		padding: 32rpx 24rpx;
		margin-left: -8rpx;
		margin-right: -8rpx;
	}
}

/* Figma head row: 308×34px — icon + title vertically centered */
.agreement-section__head {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 24rpx;
	min-height: 68rpx;
	margin-bottom: 24rpx;

	&--tall {
		min-height: 136rpx;
		align-items: center;
	}
}

/* Figma icon sizes @2x rpx */
.agreement-section__icon {
	flex-shrink: 0;
	display: block;

	&--terms {
		width: 36rpx;
		height: 38rpx;
	}

	&--user {
		width: 44rpx;
		height: 32rpx;
	}

	&--privacy {
		width: 32rpx;
		height: 40rpx;
	}

	&--warning {
		width: 44rpx;
		height: 38rpx;
	}
}

.agreement-section__title {
	flex: 1;
	min-width: 0;
	font-size: 48rpx;
	font-weight: 500;
	color: #0B1C30;
	line-height: 1.42;
	word-break: break-word;

	&--single {
		line-height: 68rpx;
	}
}

.agreement-section__body {
	display: block;
	font-size: 32rpx;
	font-weight: 400;
	color: #424754;
	line-height: 1.65;
	white-space: pre-line;
	word-break: break-word;
}

.agreement-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.agreement-list__item {
	display: flex;
	align-items: flex-start;
	gap: 16rpx;
}

.agreement-list__bullet {
	width: 12rpx;
	height: 12rpx;
	border-radius: 9999rpx;
	background: #0058BE;
	margin-top: 14rpx;
	flex-shrink: 0;
}

.agreement-list__content {
	flex: 1;
	min-width: 0;
}

.agreement-list__label {
	font-size: 32rpx;
	font-weight: 500;
	color: #0B1C30;
}

.agreement-list__text {
	font-size: 32rpx;
	color: #424754;
	line-height: 1.65;
	word-break: break-word;
}

.agreement-footer {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	background: #fff;
	border-top: 1rpx solid #E5E7EB;
	padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
	box-sizing: border-box;
	z-index: 99;
}

.agreement-submit {
	width: 100%;
	background: #0058BE;
	border-radius: 16rpx;
	padding: 32rpx;
	text-align: center;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);

	text {
		color: #fff;
		font-size: 28rpx;
		font-weight: 500;
	}
}
</style>
