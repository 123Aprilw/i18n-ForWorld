<template>
	<uv-popup ref="popupRef" mode="bottom" round="24" :z-index="10075" :overlay-opacity="0.6"
		:close-on-click-overlay="true" @change="onPopupChange">
		<view class="lang-popup">
			<view class="lang-popup__header">
				<text class="lang-popup__title">{{ t('common.selectLanguage') }}</text>
			</view>
			<view class="lang-popup__list">
				<view class="lang-option" :class="{ 'lang-option--active': tempLocale === 'jp' }"
					@click="selectLang('jp')">
					<view class="lang-option__icon-wrap">
						<image class="lang-option__icon" :src="icons.language.japanese" mode="aspectFit" />
					</view>
					<view class="lang-option__text">
						<text class="lang-option__primary">{{ t('common.japanese') }}</text>
						<text class="lang-option__secondary">{{ t('common.japaneseSub') }}</text>
					</view>
					<view v-if="tempLocale === 'jp'" class="lang-option__check">
						<uv-icon name="checkmark" color="#FFFFFF" size="14" />
					</view>
				</view>
				<view class="lang-option" :class="{ 'lang-option--active': tempLocale === 'en' }"
					@click="selectLang('en')">
					<view class="lang-option__icon-wrap">
						<image class="lang-option__icon" :src="icons.language.english" mode="aspectFit" />
					</view>
					<view class="lang-option__text">
						<text class="lang-option__primary">{{ t('common.englishName') }}</text>
						<text class="lang-option__secondary">{{ t('common.english') }}</text>
					</view>
					<view v-if="tempLocale === 'en'" class="lang-option__check">
						<uv-icon name="checkmark" color="#FFFFFF" size="14" />
					</view>
				</view>
			</view>
			<view class="lang-popup__btn" @click="confirmSelection">
				<text>{{ t('common.confirmSelection') }}</text>
			</view>
		</view>
	</uv-popup>
</template>

<script setup lang="ts">
	import { ref, watch, nextTick } from 'vue'
	import { useLocale } from '@/composables/useLocale'
	import { useLanguagePopup } from '@/composables/useLanguagePopup'
	import { icons } from '@/utils/icons'

	const { t, locale, setLocale } = useLocale()
	const { visible, closeLanguagePopup } = useLanguagePopup()
	const popupRef = ref<{ open : () => void; close : () => void } | null>(null)
	const tempLocale = ref<'jp' | 'en'>('jp')

	watch(visible, (show) => {
		if (show) {
			tempLocale.value = locale.value as 'jp' | 'en'
			nextTick(() => popupRef.value?.open())
		} else {
			popupRef.value?.close()
		}
	})

	const onPopupChange = (e : { show : boolean }) => {
		if (!e.show) closeLanguagePopup()
	}

	const closePopup = () => {
		closeLanguagePopup()
	}

	const selectLang = (lang : 'jp' | 'en') => {
		tempLocale.value = lang
	}

	const confirmSelection = () => {
		const prevLocale = locale.value
		setLocale(tempLocale.value)
		closePopup()
		// 语言发生变化时重新加载当前页面，让接口带上新的 Accept-Language 重新请求
		if (prevLocale !== tempLocale.value) {
			const pages = getCurrentPages()
			const current = pages[pages.length - 1]
			if (current) {
				const route = (current as any).route as string
				const options = (current as any).options || {}
				const query = Object.keys(options)
					.map(k => `${encodeURIComponent(k)}=${options[k]}`)
					.join('&')
				const url = '/' + route + (query ? `?${query}` : '')
				// 主 Tab 页使用 reLaunch，其他页使用 redirectTo
				const tabRoutes = ['pages/home/home', 'pages/order/list', 'pages/message/list', 'pages/profile/index']
				if (tabRoutes.includes(route)) {
					uni.reLaunch({ url })
				} else {
					uni.redirectTo({ url })
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.lang-popup {
		background: #fff;
		border-radius: 24rpx 24rpx 0 0;
		padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
	}

	.lang-popup__header {
		padding: 40rpx 32rpx 32rpx;
		border-bottom: 1rpx solid #E2E8F0;
	}

	.lang-popup__title {
		display: block;
		font-size: 32rpx;
		font-weight: 500;
		color: #0B1C30;
		line-height: 1.4;
		text-align: center;
	}

	.lang-popup__list {
		padding: 0 32rpx;
	}

	.lang-option {
		display: flex;
		align-items: center;
		gap: 24rpx;
		padding: 32rpx 0;
		border-bottom: 1rpx solid #E2E8F0;

		&:last-child {
			border-bottom: none;
		}
	}

	.lang-option__icon-wrap {
		width: 80rpx;
		height: 80rpx;
		border-radius: 9999rpx;
		background: #EFF4FF;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.lang-option__icon {
		width: 40rpx;
		height: 40rpx;
	}

	.lang-option__text {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.lang-option__primary {
		font-size: 32rpx;
		font-weight: 500;
		color: #0B1C30;
		line-height: 1.4;
	}

	.lang-option__secondary {
		font-size: 24rpx;
		font-weight: 400;
		color: #424754;
		line-height: 1.4;
	}

	.lang-option__check {
		width: 40rpx;
		height: 40rpx;
		border-radius: 9999rpx;
		background: #0058BE;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.lang-popup__btn {
		margin: 32rpx 32rpx 0;
		height: 88rpx;
		background: #0058BE;
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		text {
			color: #fff;
			font-size: 28rpx;
			font-weight: 500;
			line-height: 1.4;
		}
	}
</style>