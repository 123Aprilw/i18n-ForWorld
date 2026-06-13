<template>
	<view class="home-page">
		<view class="home-header">
			<BrandLogo />
			<LanguageSwitcher />
		</view>
		<scroll-view scroll-y class="home-body">
			<text class="section-title">{{ t('home.sectionTitle') }}</text>
			<view v-for="venue in venues" :key="venue.id" class="venue-card" @click="goVenue(venue.id)">
				<image class="venue-card__image" :src="getImageUrl(venue.cover_image)" mode="aspectFill" />
				<view class="venue-card__body">
					<text class="venue-card__name">{{ venue.name }}</text>
					<text class="venue-card__subtitle">{{ venue.subtitle }}</text>
					<text class="venue-card__address">{{ venue.address }}</text>
					<view class="venue-card__footer">
						<view class="venue-card__icons">
							<image v-for="(facility, iconIndex) in venue.facilities" :key="iconIndex"
								class="venue-card__icon" :src="getImageUrl(facility.icon)" mode="aspectFit" />
						</view>
						<view class="venue-card__btn" @click.stop="goVenue(venue.id)">
							<text>{{ t('common.bookNow') }}</text>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
		<AppTabBar current="home" />
		<LanguagePopupHost />
	</view>
</template>

<script setup lang="ts">
	import { onMounted } from 'vue'
	import { useLocale } from '@/composables/useLocale'
	import { useVenueList } from '@/composables/useVenueList'
	import { getImageUrl } from '@/src/config/env'
	import BrandLogo from '@/components/BrandLogo.vue'
	import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
	import AppTabBar from '@/components/AppTabBar.vue'
	import LanguagePopupHost from '@/components/LanguagePopupHost.vue'

	const { t } = useLocale()
	const { venues, fetchVenues } = useVenueList()

	onMounted(() => {
		fetchVenues().catch(error => {
			console.error('Failed to fetch venues:', error)
		})
	})

	const goVenue = (id : string) => {
		try {
			uni.navigateTo({ url: `/pages/venue/detail?id=${id}` })
		} catch (error) {
			console.error('Navigation error:', error)
		}
	}
</script>

<style lang="scss" scoped>
	.home-page {
		min-height: 100vh;
		background: #DAE6F3;
		padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
	}

	.home-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 32rpx;
		padding-top: calc(24rpx + env(safe-area-inset-top));
		background: rgba(255, 255, 255, 0.95);
		border-bottom: 1px solid rgba(194, 198, 214, 1);
	}

	.home-body {
		height: calc(100vh - 120rpx - env(safe-area-inset-top) - 100rpx - env(safe-area-inset-bottom));
		padding: 32rpx;
		box-sizing: border-box;
	}

	.section-title {
		display: block;
		font-size: 32rpx;
		font-weight: 500;
		color: #0B1C30;
		margin-bottom: 32rpx;
	}

	.venue-card {
		background: #fff;
		border: 1rpx solid #C2C6D6;
		border-radius: 24rpx;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
		margin-bottom: 32rpx;
		overflow: hidden;
	}

	.venue-card__image {
		display: block;
		width: 100%;
		height: 400rpx;
	}

	.venue-card__body {
		padding: 32rpx;
	}

	.venue-card__name {
		display: block;
		font-size: 32rpx;
		font-weight: 500;
		color: #0B1C30;
		margin-bottom: 8rpx;
	}

	.venue-card__subtitle {
		display: block;
		font-size: 26rpx;
		color: #424754;
		line-height: 1.6;
		margin-bottom: 8rpx;
	}

	.venue-card__address {
		display: block;
		font-size: 24rpx;
		color: #6B7280;
		line-height: 1.6;
		margin-bottom: 24rpx;
	}

	.venue-card__footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.venue-card__icons {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.venue-card__icon {
		width: 50rpx;
		height: 50rpx;
	}

	.venue-card__btn {
		background: #3B82F6;
		border-radius: 16rpx;
		padding: 16rpx 32rpx;

		text {
			color: #fff;
			font-size: 26rpx;
			font-weight: 500;
		}
	}
</style>