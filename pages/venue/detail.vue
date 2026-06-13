<template>
	<view class="venue-page">
		<PageHeader :title="t('venue.detailTitle')" show-lang background="rgba(248, 249, 255, 0.98)" />
		<scroll-view scroll-y class="venue-body" :scroll-into-view="scrollTarget">
			<view class="venue-gallery-wrap">
				<swiper class="venue-gallery" :current="galleryIndex" circular :autoplay="galleryAutoplay"
					:interval="4000" :duration="400" @change="onGalleryChange">
					<swiper-item v-for="(img, index) in (venue.value ? (venue.value.images.length > 0 ? venue.value.images : [venue.value.cover_image]) : displayVenue.gallery)" :key="index">
						<view class="venue-gallery__slide" @click="previewGallery(index)">
							<image class="venue-gallery__image" :src="getImageUrl(img)" mode="aspectFill" />
							<view class="venue-gallery__gradient" />
							<view v-if="!venue.value && displayVenue.hasVideo && index === 0" class="venue-gallery__video"
								@click.stop="playVideo">
								<view class="venue-gallery__play">
									<view class="venue-gallery__play-icon" />
								</view>
								<text class="venue-gallery__video-text">{{ t('venue.watchVideo') }}</text>
							</view>
						</view>
					</swiper-item>
				</swiper>
				<view class="venue-gallery__dots">
					<view v-for="(_, index) in (venue.value ? (venue.value.images.length > 0 ? venue.value.images : [venue.value.cover_image]) : displayVenue.gallery)" :key="index" class="venue-gallery__dot"
						:class="{ 'venue-gallery__dot--active': galleryIndex === index }"
						@click="setGalleryIndex(index)" />
				</view>
			</view>

			<view class="venue-content">
				<view class="venue-title-block">
					<text class="venue-title">{{ venue.value ? venue.value.name : t(displayVenue.nameKey) }}</text>
					<view class="venue-location" @click="openMap">
						<image class="venue-location__pin" src="/static/images/venues/location-pin.png"
							mode="aspectFit" />
						<text class="venue-location__text">{{ venue.value ? venue.value.address : t(displayVenue.locationKey) }}</text>
					</view>
				</view>

				<view class="venue-section">
					<text class="venue-section__heading">{{ t('venue.experienceTitle') }}</text>
					<text class="venue-section__body">{{ venue.value ? venue.value.description : t(displayVenue.experienceDescKey) }}</text>
				</view>

				<view class="venue-section">
					<text
						class="venue-section__heading venue-section__heading--light">{{ t('venue.servicesTitle') }}</text>
					<view class="amenity-grid">
						<view v-for="(item, index) in (venue.value ? venue.value.facilities : displayVenue.amenities)" :key="index" class="amenity-card"
							:class="{ 'amenity-card--active': activeAmenity === (venue.value ? item.name : item.labelKey) }"
							@click="toggleAmenity(venue.value ? item.name : item.labelKey)">
							<view class="amenity-card__icon-wrap">
								<image class="amenity-card__icon" :src="getImageUrl(venue.value ? item.icon : item.icon)" mode="aspectFit" />
							</view>
							<text class="amenity-card__label">{{ venue.value ? item.name : t(item.labelKey) }}</text>
						</view>
					</view>
				</view>

				<view class="venue-section">
					<text class="venue-section__heading">{{ t('venue.spaceFeaturesTitle') }}</text>
					<view class="bento-list">
						<view v-for="(card, index) in (venue.value ? venue.value.features : displayVenue.bentoCards)" :id="`bento-${index}`" :key="index"
							class="bento-card" :class="{ 'bento-card--selected': selectedSpace === index.toString() }"
							@click="selectSpace(index.toString())">
							<image class="bento-card__image" :src="getImageUrl(venue.value ? card.image : card.image)" mode="widthFix" />
							<view class="bento-card__body">
								<text class="bento-card__title">{{ venue.value ? card.title : t(card.titleKey) }}</text>
								<text class="bento-card__desc">{{ venue.value ? card.description : t(card.descKey) }}</text>
							</view>
						</view>
					</view>
				</view>

				<view class="info-card">
					<text class="info-card__title">{{ t('venue.usageGuideTitle') }}</text>
					<view class="info-card__body">
						<view class="info-card__section">
							<image class="info-card__icon" :src="icons.clock" mode="aspectFit" />
							<view class="info-card__section-content">
								<text class="info-card__section-title">{{ t('venue.businessHoursLabel') }}</text>
								<text class="info-card__section-text">{{ venue.value ? `${venue.value.open_time} - ${venue.value.close_time}` : t('venue.businessHoursDaily') }}</text>
							</view>
						</view>
						<view class="info-card__section">
							<image class="info-card__icon" :src="icons.gavel" mode="aspectFit" />
							<view class="info-card__section-content">
								<text class="info-card__section-title">{{ t('venue.houseRulesLabel') }}</text>
								<view class="info-card__rules">
									<text v-if="venue.value" class="info-card__rule">{{ venue.value.house_rules }}</text>
									<template v-else>
										<text class="info-card__rule">{{ t('venue.houseRule1') }}</text>
										<text class="info-card__rule">{{ t('venue.houseRule2') }}</text>
										<text class="info-card__rule">{{ t('venue.houseRule3') }}</text>
									</template>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<BottomActionBar :text="t('common.bookNow')" @click="goBooking" />
		<LanguagePopupHost />
	</view>
</template>

<script setup lang="ts">
	import { ref, computed, onMounted } from 'vue'
	import { onLoad, onShow, onHide } from '@dcloudio/uni-app'
	import { useLocale } from '@/composables/useLocale'
	import { useVenueDetail } from '@/composables/useVenueDetail'
	import { venues } from '@/utils/mock'
	import { icons } from '@/utils/icons'
	import { getImageUrl } from '@/src/config/env'
	import PageHeader from '@/components/PageHeader.vue'
	import BottomActionBar from '@/components/BottomActionBar.vue'
	import LanguagePopupHost from '@/components/LanguagePopupHost.vue'

	const { t } = useLocale()
	const { venue, loading, fetchVenueDetail } = useVenueDetail()
	
	const venueId = ref('1')
	const galleryIndex = ref(0)
	const galleryAutoplay = ref(true)
	const activeAmenity = ref('')
	const selectedSpace = ref('')
	const scrollTarget = ref('')

	onLoad((query) => {
		if (query?.id) venueId.value = query.id as string
		if (query?.space) selectedSpace.value = query.space as string
	})

	onMounted(async () => {
		if (venueId.value) {
			try {
				await fetchVenueDetail(venueId.value)
			} catch (error) {
				console.error('获取场馆详情失败:', error)
				// 如果API调用失败，回退到mock数据
				console.log('使用mock数据')
			}
		}
	})

	onShow(() => {
		galleryAutoplay.value = true
	})

	onHide(() => {
		galleryAutoplay.value = false
	})

	// 兼容mock数据结构，如果API数据为空则使用mock
	const displayVenue = computed(() => {
		if (venue.value) {
			// 解析images字段（从JSON字符串转为数组）
			let imagesArray: string[] = []
			try {
				if (venue.value.images) {
					imagesArray = JSON.parse(venue.value.images)
				}
			} catch (e) {
				console.error('解析images失败:', e)
			}
			
			// 如果解析失败或为空，使用cover_image
			if (!imagesArray || imagesArray.length === 0) {
				imagesArray = [venue.value.cover_image]
			}
			
			// 将API数据转换为页面需要的格式
			return {
				id: venue.value.id.toString(),
				nameKey: 'venue.name',
				locationKey: 'venue.location',
				experienceTitleKey: 'venue.experienceTitle',
				experienceDescKey: 'venue.experienceDesc',
				gallery: imagesArray,
				hasVideo: false,
				amenities: venue.value.facilities.map(f => ({
					name: f.name,
					name_en: f.name_en,
					labelKey: 'venue.facility',
					icon: f.icon
				})),
				bentoCards: venue.value.features.map(f => ({
					spaceType: 'feature',
					title: f.title,
					title_en: f.title_en,
					description: f.description,
					description_en: f.description_en,
					titleKey: 'venue.featureTitle',
					descKey: 'venue.featureDesc',
					image: f.image
				})),
				houseRules: venue.value.rules
			}
		}
		// 回退到mock数据
		return venues.find(v => v.id === venueId.value) || venues[0]
	})

	const onGalleryChange = (e : { detail : { current : number } }) => {
		galleryIndex.value = e.detail.current
	}

	const setGalleryIndex = (index : number) => {
		galleryIndex.value = index
	}

	const previewGallery = (index : number) => {
		uni.previewImage({
			current: index,
			urls: displayVenue.value.gallery.map((img: string) => getImageUrl(img))
		})
	}

	const playVideo = () => {
		uni.showToast({ title: t('venue.videoComingSoon'), icon: 'none' })
	}

	const toggleAmenity = (key : string) => {
		activeAmenity.value = activeAmenity.value === key ? '' : key

	}
	const selectSpace = (spaceType : string) => {
		selectedSpace.value = selectedSpace.value === spaceType ? '' : spaceType
		scrollTarget.value = ''
		setTimeout(() => {
			scrollTarget.value = `bento-${spaceType}`
		}, 50)
	}

	const openMap = () => {
		uni.showToast({ title: t(displayVenue.value.locationKey).split('\n')[0], icon: 'none', duration: 2500 })
	}

	const goBooking = () => {
		const spaceQuery = selectedSpace.value ? `&space=${selectedSpace.value}` : ''
		uni.navigateTo({ url: `/pages/seat/date?venueId=${venueId.value}${spaceQuery}` })
	}
</script>

<style lang="scss" scoped>
	.venue-page {
		min-height: 100vh;
		background: #F8F9FF;
		padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
	}

	.venue-body {
		height: calc(100vh - 120rpx - 140rpx - env(safe-area-inset-top) - env(safe-area-inset-bottom));
	}

	.venue-gallery-wrap {
		padding: 32rpx 32rpx 0;
	}

	.venue-gallery {
		height: 330rpx;
		border-radius: 24rpx;
		overflow: hidden;
	}

	.venue-gallery__slide {
		position: relative;
		width: 100%;
		height: 330rpx;
	}

	.venue-gallery__image {
		width: 100%;
		height: 100%;
	}

	.venue-gallery__gradient {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(11, 28, 48, 0) 40%, rgba(11, 28, 48, 0.35) 100%);
		pointer-events: none;
	}

	.venue-gallery__video {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
	}

	.venue-gallery__play {
		width: 96rpx;
		height: 96rpx;
		border-radius: 24rpx;
		background: rgba(255, 255, 255, 0.92);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
	}

	.venue-gallery__play-icon {
		width: 0;
		height: 0;
		border-top: 16rpx solid transparent;
		border-bottom: 16rpx solid transparent;
		border-left: 26rpx solid #0B1C30;
		margin-left: 8rpx;
	}

	.venue-gallery__video-text {
		font-size: 22rpx;
		font-weight: 600;
		color: #fff;
		letter-spacing: 2rpx;
		text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.35);
	}

	.venue-gallery__dots {
		display: flex;
		justify-content: center;
		gap: 12rpx;
		margin-top: 20rpx;
	}

	.venue-gallery__dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 9999rpx;
		background: #C2C6D6;
		transition: all 0.25s ease;

		&--active {
			width: 32rpx;
			background: #0058BE;
		}
	}

	.venue-content {
		padding: 40rpx 32rpx 32rpx;
	}

	.venue-title-block {
		margin-bottom: 48rpx;
	}

	.venue-title {
		display: block;
		font-size: 48rpx;
		font-weight: 600;
		color: #0B1C30;
		line-height: 1.35;
		margin-bottom: 20rpx;
	}

	.venue-location {
		display: flex;
		align-items: flex-start;
		gap: 12rpx;
	}

	.venue-location__pin {
		width: 26rpx;
		height: 32rpx;
		flex-shrink: 0;
		margin-top: 4rpx;
	}

	.venue-location__text {
		flex: 1;
		font-size: 28rpx;
		color: #424754;
		line-height: 1.6;
		white-space: pre-line;
	}

	.venue-section {
		margin-bottom: 48rpx;
	}

	.venue-section__heading {
		display: block;
		font-size: 48rpx;
		font-weight: 500;
		color: #0B1C30;
		margin-bottom: 24rpx;

		&--light {
			font-weight: 400;
		}
	}

	.venue-section__body {
		display: block;
		font-size: 36rpx;
		color: #424754;
		line-height: 1.65;
	}

	.amenity-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24rpx;
	}

	.amenity-card {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 20rpx 20rpx;
		background: #fff;
		border: 1rpx solid #C2C6D6;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.03);
		transition: border-color 0.2s ease, box-shadow 0.2s ease;

		&--active {
			border-color: #0058BE;
			box-shadow: 0 0 0 2rpx rgba(0, 88, 190, 0.15);
		}
	}

	.amenity-card__icon-wrap {
		width: 64rpx;
		height: 64rpx;
		border-radius: 12rpx;
		background: #E8EEF7;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.amenity-card__icon {
		width: 40rpx;
		height: 40rpx;
	}

	.amenity-card__label {
		flex: 1;
		font-size: 24rpx;
		color: #0B1C30;
		line-height: 1.35;
	}

	.bento-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.bento-card {
		background: #fff;
		border: 1rpx solid #C2C6D6;
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
		transition: border-color 0.2s ease, transform 0.2s ease;

		&--selected {
			border-color: #0058BE;
			transform: scale(0.995);
		}
	}

	.bento-card__image {
		display: block;
		width: 100%;
	}

	.bento-card__body {
		padding: 32rpx;
	}

	.bento-card__title {
		display: block;
		font-size: 36rpx;
		font-weight: 500;
		color: #0B1C30;
		margin-bottom: 16rpx;
	}

	.bento-card__desc {
		display: block;
		font-size: 28rpx;
		color: #424754;
		line-height: 1.65;
	}

.info-card {
		background: #fff;
		border: 1rpx solid #C2C6D6;
		border-radius: 24rpx;
		padding: 64rpx;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
	}

	.info-card__title {
		display: block;
		font-size: 48rpx;
		font-weight: 500;
		color: #0B1C30;
		line-height: 1.4;
	}

	.info-card__rows {
		margin-top: 32rpx;
	}

	.info-card__row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #C2C6D6;

		&:first-child {
			padding-top: 0;
		}

		&--last {
			border-bottom: none;
			padding-bottom: 0;
		}
	}

	.info-card__label {
		font-size: 28rpx;
		color: #424754;
		line-height: 1.4;
	}

	.info-card__value {
		font-size: 28rpx;
		font-weight: 500;
		color: #0B1C30;
		line-height: 1.4;

		&--price {
			color: #0058BE;
		}
	}

	.info-card__body {
		margin-top: 48rpx;
		padding-top: 48rpx;
		border-top: 1rpx solid #C2C6D6;
		display: flex;
		flex-direction: column;
		gap: 32rpx;
	}

	.info-card__section {
		display: flex;
		align-items: flex-start;
		align-items: center;
		gap: 24rpx;
	}

	.info-card__icon {
		width: 40rpx;
		height: 40rpx;
		flex-shrink: 0;
		margin-top: 2rpx;
	}

	.info-card__section-content {
		flex: 1;
		min-width: 0;
	}

	.info-card__section-title {
		display: block;
		font-size: 28rpx;
		font-weight: 500;
		color: #0B1C30;
		line-height: 1.4;
		margin-bottom: 8rpx;
	}

	.info-card__section-text {
		display: block;
		font-size: 24rpx;
		font-weight: 500;
		color: #424754;
		line-height: 1.4;
	}

	.info-card__rules {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.info-card__rule {
		display: block;
		font-size: 24rpx;
		font-weight: 500;
		color: #424754;
		line-height: 1.4;
	}
</style>