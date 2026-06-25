<template>
	<view class="venue-page">
		<PageLoading :visible="loading && !venue" type="venue" />
		<PageHeader :title="t('venue.detailTitle')" show-lang background="rgba(248, 249, 255, 0.98)" />
		<PullRefresh class="venue-body" :refresh="onRefresh">
			<view class="venue-gallery-wrap">
				<swiper class="venue-gallery" :current="galleryIndex" circular :autoplay="galleryAutoplay"
					:interval="4000" :duration="400" @change="onGalleryChange">
					<swiper-item v-for="(img, index) in displayVenue.gallery" :key="index">
						<view class="venue-gallery__slide" @click="previewGallery(index)">
							<image class="venue-gallery__image" :src="getImageUrl(img)" mode="aspectFill" />
							<view class="venue-gallery__gradient" />
							<view v-if="!venue && displayVenue.hasVideo && index === 0" class="venue-gallery__video"
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
					<view v-for="(_, index) in displayVenue.gallery" :key="index" class="venue-gallery__dot"
						:class="{ 'venue-gallery__dot--active': galleryIndex === index }"
						@click="setGalleryIndex(index)" />
				</view>
			</view>

			<view class="venue-content">
				<view class="venue-title-block">
					<text class="venue-title">{{ locale === 'en' ? (venue?.name_en || venue?.name) : (venue?.name || t(displayVenue.nameKey)) }}</text>
					<view class="venue-location" @click="openMap">
						<image class="venue-location__pin" src="/static/images/venues/location-pin.png"
							mode="aspectFit" />
						<text class="venue-location__text">{{ locale === 'en' ? (venue?.address_en || venue?.address) : (venue?.address || t(displayVenue.locationKey)) }}</text>
					</view>
				</view>

				<view class="venue-section">
					<text class="venue-section__heading">{{ t('venue.experienceTitle') }}</text>
					<rich-text class="venue-section__body" :nodes="locale === 'en' ? (displayVenue.description_en || displayVenue.description || t(displayVenue.experienceDescKey)) : (displayVenue.description || t(displayVenue.experienceDescKey))" />
				</view>

				<view class="venue-section">
					<text
						class="venue-section__heading venue-section__heading--light">{{ t('venue.servicesTitle') }}</text>
					<view class="amenity-grid">
						<view v-for="(item, index) in (venue?.facilities || displayVenue.amenities)" :key="index" class="amenity-card"
							:class="{ 'amenity-card--active': activeAmenity === (venue ? item.name : item.labelKey) }"
							@click="toggleAmenity(venue ? item.name : item.labelKey)">
							<view class="amenity-card__icon-wrap">
								<image class="amenity-card__icon" :src="getImageUrl(venue ? item.icon : item.icon)" mode="aspectFit" />
							</view>
							<text class="amenity-card__label">{{ venue ? (locale === 'en' ? (item.name_en || item.name) : item.name) : t(item.labelKey) }}</text>
						</view>
					</view>
				</view>

				<view class="venue-section">
					<text class="venue-section__heading">{{ t('venue.spaceFeaturesTitle') }}</text>
					<view class="bento-list">
						<view v-for="(card, index) in (venue?.features || displayVenue.bentoCards)" :id="`bento-${index}`" :key="index"
							class="bento-card" :class="{ 'bento-card--selected': selectedSpace === index.toString() }"
							@click="selectSpace(index.toString())">
							<image class="bento-card__image" :src="getImageUrl(venue ? card.image : card.image)" mode="widthFix" />
							<view class="bento-card__body">
								<text class="bento-card__title">{{ venue ? (locale === 'en' ? (card.title_en || card.title) : card.title) : t(card.titleKey) }}</text>
								<text class="bento-card__desc">{{ venue ? (locale === 'en' ? (card.description_en || card.description) : card.description) : t(card.descKey) }}</text>
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
								<text class="info-card__section-text">{{ venue?.open_time ? `${venue.open_time} - ${venue.close_time}` : t('venue.businessHoursDaily') }}</text>
							</view>
						</view>
						<view class="info-card__section">
							<image class="info-card__icon" :src="icons.gavel" mode="aspectFit" />
							<view class="info-card__section-content">
								<text class="info-card__section-title">{{ t('venue.houseRulesLabel') }}</text>
								<view class="info-card__rules">
									<view v-if="venue && venue.house_rules" class="info-card__rule">{{ locale === 'en' ? (venue.house_rules_en || venue.house_rules) : venue.house_rules }}</view>
									<template v-else>
										<view class="info-card__rule">{{ t('venue.houseRule1') }}</view>
										<view class="info-card__rule">{{ t('venue.houseRule2') }}</view>
										<view class="info-card__rule">{{ t('venue.houseRule3') }}</view>
									</template>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 注意事项 -->
				<view class="venue-notice-section">
					<text class="venue-notice-section__title">{{ t('seat.precautionsTitle') }}</text>
					<view v-if="noticeList.length > 0" class="venue-notice-section__list">
						<view v-for="(item, index) in noticeList" :key="index" class="venue-notice-section__item">
							<image class="venue-notice-section__icon" :src="getImageUrl(item.icon)" mode="aspectFit" />
							<text class="venue-notice-section__text">{{ locale === 'en' ? (item.content_en || item.content) : item.content }}</text>
						</view>
					</view>
					<view v-else class="venue-notice-section__list">
						<view v-for="item in fallbackNotice" :key="item.key" class="venue-notice-section__item">
							<image class="venue-notice-section__icon" :src="item.icon" mode="aspectFit" />
							<text class="venue-notice-section__text">{{ t(item.key) }}</text>
						</view>
					</view>
				</view>
			</view>
		</PullRefresh>

		<BottomActionBar :text="t('common.bookNow')" @click="goBooking" />
		<LanguagePopupHost />

		<!-- 未登录提示弹窗 -->
		<uv-popup ref="loginRequiredPopupRef" mode="center" round="24" :z-index="10080" :overlay-opacity="0.6" :close-on-click-overlay="true">
			<view class="login-required-popup">
				<view class="login-required-popup__icon">
					<uv-icon name="lock" color="#0058BE" size="44" />
				</view>
				<text class="login-required-popup__title">{{ t('common.loginRequiredTitle') }}</text>
				<text class="login-required-popup__desc">{{ t('common.loginRequiredContent') }}</text>
				<view class="login-required-popup__actions">
					<view class="login-required-popup__btn login-required-popup__btn--primary" @click="goLogin">
						<text>{{ t('common.goLoginBtn') }}</text>
					</view>
					<view class="login-required-popup__btn login-required-popup__btn--ghost" @click="loginRequiredPopupRef?.close()">
						<text>{{ t('common.cancel') }}</text>
					</view>
				</view>
			</view>
		</uv-popup>
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
	import api from '@/utils/api'
	import PageHeader from '@/components/PageHeader.vue'
	import BottomActionBar from '@/components/BottomActionBar.vue'
	import LanguagePopupHost from '@/components/LanguagePopupHost.vue'
	import PullRefresh from '@/components/PullRefresh.vue'
	import PageLoading from '@/components/PageLoading.vue'

	const { t, locale } = useLocale()
	const { venue, loading, fetchVenueDetail } = useVenueDetail()
	// 注意事项
	const noticeList = ref<Array<{ content: string; content_en?: string; icon: string }>>([])
	const fallbackNotice = [
		{ key: 'seat.precaution1', icon: '/static/images/facilities/silence.png' },
		{ key: 'seat.precaution2', icon: '/static/images/smoking.png' },
		{ key: 'seat.precaution3', icon: '/static/images/animals.png' },
		{ key: 'seat.precaution4', icon: '/static/images/food.png' },
		{ key: 'seat.precaution5', icon: '/static/images/clean.png' },
		{ key: 'seat.precaution6', icon: '/static/images/time.png' },
		{ key: 'seat.precaution7', icon: '/static/images/fire.png' },
		{ key: 'seat.precaution8', icon: '/static/images/locks.png' }
	]

	const fetchNotice = async () => {
		try {
			const response = await api.GetPayNotice()
			const notices = response?.data?.notices ?? response?.data ?? null
			if (Array.isArray(notices) && notices.length > 0) {
				noticeList.value = notices
			} else {
				noticeList.value = []
			}
		} catch (e) {
			noticeList.value = []
		}
	}
	
	const venueId = ref('1')
	const galleryIndex = ref(0)
	const galleryAutoplay = ref(true)
	const activeAmenity = ref('')
	const selectedSpace = ref('')
	const scrollTarget = ref('')
	const coverImage = ref('')
	const loginRequiredPopupRef = ref<{ open: () => void; close: () => void } | null>(null)

	onLoad((query) => {
		if (query?.id) venueId.value = query.id as string
		if (query?.space) selectedSpace.value = query.space as string
		if (query?.cover_image) coverImage.value = query.cover_image as string
	})

	onMounted(async () => {
		if (venueId.value) {
			try {
				const data = await fetchVenueDetail(venueId.value)
				console.log('场馆详情数据:', data)
				console.log('venue.value:', venue.value)
			} catch (error) {
				console.error('获取场馆详情失败:', error)
				console.log('使用mock数据')
			}
		}
		// 加载注意事项
		await fetchNotice()
	})

	onShow(() => {
		galleryAutoplay.value = true
	})

	onHide(() => {
		galleryAutoplay.value = false
	})

	// 兼容mock数据结构，如果API数据为空则使用mock
	const displayVenue = computed(() => {
		console.log('displayVenue计算 - venue.value:', venue.value)
		console.log('displayVenue计算 - coverImage.value:', coverImage.value)
		
		if (venue.value) {
			// 处理images字段（可能是数组、JSON字符串或逗号分隔的字符串）
			let imagesArray: string[] = []
			if (venue.value.images) {
				if (Array.isArray(venue.value.images)) {
					// 如果是数组，直接拆分第一个元素（无论是否包含逗号）
					if (venue.value.images.length > 0 && typeof venue.value.images[0] === 'string') {
						imagesArray = venue.value.images[0].split(',').map(s => s.trim()).filter(s => s.length > 0)
						console.log('拆分后的图片数组:', imagesArray)
					} else {
						// 如果数组的第一个元素不是字符串，则过滤出所有字符串元素
						imagesArray = venue.value.images.filter(s => typeof s === 'string' && s.length > 0)
						console.log('过滤后的图片数组:', imagesArray)
					}
				} else if (typeof venue.value.images === 'string') {
					// 尝试解析JSON字符串
					try {
						const parsed = JSON.parse(venue.value.images)
						if (Array.isArray(parsed)) {
							imagesArray = parsed
						} else if (typeof parsed === 'string' && parsed.includes(',')) {
							// 如果解析后是逗号分隔的字符串
							imagesArray = parsed.split(',').map(s => s.trim()).filter(s => s.length > 0)
						} else {
							imagesArray = [parsed]
						}
					} catch (e) {
						// 如果不是JSON，检查是否是逗号分隔的字符串
						if (venue.value.images.includes(',')) {
							imagesArray = venue.value.images.split(',').map(s => s.trim()).filter(s => s.length > 0)
						} else {
							imagesArray = [venue.value.images]
						}
					}
				}
			}

			// 如果传递了coverImage参数，优先使用它
			if (coverImage.value) {
				imagesArray = [coverImage.value]
			}
			// 如果为空，使用cover_image
			else if (!imagesArray || imagesArray.length === 0) {
				imagesArray = [venue.value.cover_image]
			}

			// 将API数据转换为页面需要的格式
			const result = {
				id: venue.value.id.toString(),
				nameKey: 'venue.name',
				locationKey: 'venue.location',
				experienceTitleKey: 'venue.experienceTitle',
				experienceDescKey: 'venue.experienceDesc',
				description: venue.value.description ? venue.value.description
					.replace(/white-space\s*:\s*pre\s*;/gi, 'white-space: pre-wrap;')
					.trim() : '',
				description_en: venue.value.description_en ? venue.value.description_en
					.replace(/white-space\s*:\s*pre\s*;/gi, 'white-space: pre-wrap;')
					.trim() : '',
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
					description: f.description ? f.description.replace(/white-space\s*:\s*pre\s*;/gi, 'white-space: pre-wrap;') : '',
					description_en: f.description_en ? f.description_en.replace(/white-space\s*:\s*pre\s*;/gi, 'white-space: pre-wrap;') : '',
					titleKey: 'venue.featureTitle',
					descKey: 'venue.featureDesc',
					image: f.image
				})),
				houseRules: venue.value.house_rules ? venue.value.house_rules
					.replace(/white-space\s*:\s*pre\s*;/gi, 'white-space: pre-wrap;')
					.replace(/&nbsp;/g, ' ') // 替换HTML空格
					.trim() : ''
			}
			console.log('displayVenue计算结果:', result)
			return result
		}
		// 回退到mock数据，也要应用coverImage
		console.log('使用mock数据，venueId:', venueId.value)
		const mockVenue = venues.find(v => v.id === venueId.value) || venues[0]
		
		// 如果传递了coverImage参数，覆盖mock数据的gallery
		if (coverImage.value) {
			return {
				...mockVenue,
				gallery: [coverImage.value]
			}
		}
		
		return mockVenue
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

	const onRefresh = async () => {
		if (venueId.value) {
			try {
				// keepExisting=true：刷新时保留旧数据，不触发骨架屏
				await fetchVenueDetail(venueId.value, true)
			} catch (error) {
				console.error('刷新场馆详情失败:', error)
			}
		}
		await fetchNotice()
	}

	const goBooking = () => {
		// 检查登录状态
		const token = uni.getStorageSync('token')
		if (!token) {
			loginRequiredPopupRef.value?.open()
			return
		}
		const spaceQuery = selectedSpace.value ? `&space=${selectedSpace.value}` : ''
		uni.navigateTo({ url: `/pages/seat/date?venueId=${venueId.value}${spaceQuery}` })
	}

	const goLogin = () => {
		loginRequiredPopupRef.value?.close()
		// 记录来源页，登录后跳回当前场馆
		const spaceQuery = selectedSpace.value ? `&space=${selectedSpace.value}` : ''
		const redirect = encodeURIComponent(`/pages/seat/date?venueId=${venueId.value}${spaceQuery}`)
		uni.navigateTo({ url: `/pages/login/login?redirect=${redirect}` })
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
		white-space: normal !important;
		word-wrap: break-word !important;
		overflow-wrap: break-word !important;
	}

	/* 注意事项 */
	.venue-notice-section {
		margin-top: 48rpx;
		background: #FFFFFF;
		border: 1rpx solid #C2C6D6;
		border-radius: 24rpx;
		padding: 40rpx;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
	}

	.venue-notice-section__title {
		display: block;
		font-size: 32rpx;
		font-weight: 500;
		color: #0B1C30;
		margin-bottom: 32rpx;
	}

	.venue-notice-section__list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.venue-notice-section__item {
		display: flex;
		align-items: center;
		gap: 24rpx;
		background: #F8F9FF;
		border-radius: 16rpx;
		padding: 20rpx 24rpx;
	}

	.venue-notice-section__icon {
		width: 48rpx;
		height: 48rpx;
		flex-shrink: 0;
	}

	.venue-notice-section__text {
		flex: 1;
		font-size: 26rpx;
		color: #424754;
		line-height: 1.5;
	}

	/* 未登录提示弹窗 */
	.login-required-popup {
		width: 620rpx;
		padding: 56rpx 48rpx 48rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24rpx;
	}

	.login-required-popup__icon {
		width: 112rpx;
		height: 112rpx;
		border-radius: 50%;
		background: #E8EEF7;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 8rpx;
	}

	.login-required-popup__title {
		font-size: 36rpx;
		font-weight: 600;
		color: #0B1C30;
		text-align: center;
	}

	.login-required-popup__desc {
		font-size: 28rpx;
		color: #424754;
		text-align: center;
		line-height: 1.6;
	}

	.login-required-popup__actions {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		margin-top: 16rpx;
	}

	.login-required-popup__btn {
		width: 100%;
		padding: 28rpx;
		border-radius: 16rpx;
		text-align: center;

		text {
			font-size: 30rpx;
			font-weight: 500;
		}

		&--primary {
			background: #0058BE;
			text { color: #fff; }
		}

		&--ghost {
			background: #F0F2F8;
			text { color: #424754; }
		}
	}
</style>