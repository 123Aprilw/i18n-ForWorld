<template>
	<view class="home-page">
		<PageLoading :visible="initialLoading" />
		<view class="home-header">
			<BrandLogo />
			<LanguageSwitcher />
		</view>
		<PullRefresh 
			class="home-body" 
			:refresh="handleRefresh"
			:loadMore="handleLoadMore"
			:hasMore="hasMore"
			:isLoadingMore="isLoadingMore"
		>
			<text class="section-title">{{ t('home.sectionTitle') }}</text>
			<view
				v-for="(venue, index) in venues"
				:key="venue.id"
				class="venue-card"
				:class="{ 'venue-card--visible': visibleCards[String(venue.id)] }"
				:style="{ animationDelay: `${index * 80}ms` }"
				@click="goVenue(venue.id)"
			>
				<image class="venue-card__image" :src="getImageUrl(venue.cover_image)" mode="aspectFill" />
				<view class="venue-card__body">
					<text class="venue-card__name">{{ locale === 'en' ? (venue.name_en || venue.name) : venue.name }}</text>
					<text class="venue-card__subtitle">{{ locale === 'en' ? (venue.subtitle_en || venue.subtitle) : venue.subtitle }}</text>
					<text class="venue-card__address">{{ locale === 'en' ? (venue.address_en || venue.address) : venue.address }}</text>
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
		</PullRefresh>
		<AppTabBar current="home" />
		<LanguagePopupHost />
	</view>
</template>

<script setup lang="ts">
	import { ref, watch } from 'vue'
	import { onShow } from '@dcloudio/uni-app'
	import { useLocale } from '@/composables/useLocale'
	import { useVenueList } from '@/composables/useVenueList'
	import { getImageUrl } from '@/src/config/env'
	import BrandLogo from '@/components/BrandLogo.vue'
	import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
	import AppTabBar from '@/components/AppTabBar.vue'
	import LanguagePopupHost from '@/components/LanguagePopupHost.vue'
	import PullRefresh from '@/components/PullRefresh.vue'
	import PageLoading from '@/components/PageLoading.vue'

	const { t, locale } = useLocale()
	const { venues, fetchVenues, loading, hasMore, loadMore } = useVenueList()

	const isLoadingMore = ref(false)
	const initialLoading = ref(true)
	// 用普通对象记录哪些卡片已可见，Vue 能稳定追踪对象属性变化
	const visibleCards = ref<Record<string, boolean>>({})

	// 数据加载后依次触发卡片动画
	watch(venues, (newVenues) => {
		newVenues.forEach((venue, index) => {
			const idKey = String(venue.id)
			if (!visibleCards.value[idKey]) {
				setTimeout(() => {
					visibleCards.value = { ...visibleCards.value, [idKey]: true }
				}, index * 80)
			}
		})
	}, { immediate: true })

	onShow(() => {
		// onShow 覆盖了 onMounted，首次进入和切换回来都走这里
		visibleCards.value = {}  // 清空，让 watch 重新触发入场动画
		initialLoading.value = true
		fetchVenues(1, true).then(() => {
			initialLoading.value = false
		}).catch(error => {
			console.error('Failed to refresh venues:', error)
			initialLoading.value = false
		})
	})

	const handleRefresh = async () => {
		await fetchVenues(1, true)
	}

	const handleLoadMore = async () => {
		if (isLoadingMore.value) return
		isLoadingMore.value = true
		try {
			await loadMore()
		} finally {
			isLoadingMore.value = false
		}
	}

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
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #DAE6F3;
	}

	.home-header {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 32rpx;
		padding-top: calc(24rpx + env(safe-area-inset-top));
		background: rgba(255, 255, 255, 0.95);
		border-bottom: 1px solid rgba(194, 198, 214, 1);
		z-index: 100;
	}

	.home-body {
		flex: 1;
		min-height: 0;
		height: 0;
		padding: 32rpx;
		padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
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
		opacity: 0;
		transform: translateY(40rpx);
		transition: opacity 0.45s ease, transform 0.45s ease;

		&--visible {
			opacity: 1;
			transform: translateY(0);
		}
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