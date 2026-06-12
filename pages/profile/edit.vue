<template>
	<view class="edit-page">
		<PageHeader
			hide-title
			show-lang
			glass
			back-color="#0058BE"
			background="rgba(248, 249, 255, 0.8)"
		/>
		<scroll-view scroll-y class="edit-body" :show-scrollbar="false">
			<view class="avatar-section" @click="chooseAvatar">
				<view class="avatar-section__wrap">
					<view class="avatar-section__glow" />
					<view class="avatar-section__ring">
						<image class="avatar-section__image" :src="avatar" mode="aspectFill" />
					</view>
					<view class="avatar-section__camera">
						<image class="avatar-section__camera-icon" :src="icons.profile.camera" mode="aspectFit" />
					</view>
				</view>
				<text class="avatar-section__hint">{{ t('profile.tapToChange') }}</text>
			</view>

			<view class="edit-card">
				<view class="field">
					<text class="field__label">{{ t('profile.nickname') }}</text>
					<view class="field__input">
						<input
							v-model="nickname"
							type="text"
							:placeholder="t('profile.nicknamePlaceholder')"
							placeholder-class="placeholder"
						/>
					</view>
				</view>
				<view class="field">
					<text class="field__label">{{ t('profile.email') }}</text>
					<view class="field__input">
						<input
							v-model="email"
							type="text"
							:placeholder="t('profile.emailPlaceholder')"
							placeholder-class="placeholder"
						/>
					</view>
				</view>
			</view>
		</scroll-view>
		<BottomActionBar :text="t('profile.saveChanges')" @click="handleSave" />
		<LanguagePopupHost />

		<uv-popup
			ref="avatarSheetRef"
			mode="bottom"
			round="24"
			:overlay-opacity="0.6"
			:close-on-click-overlay="true"
			:z-index="10080"
		>
			<view class="avatar-sheet">
				<view class="avatar-sheet__item" @click="pickImage('camera')">
					<text>{{ t('profile.takePhoto') }}</text>
				</view>
				<view class="avatar-sheet__divider" />
				<view class="avatar-sheet__item" @click="pickImage('album')">
					<text>{{ t('profile.chooseFromAlbum') }}</text>
				</view>
				<view class="avatar-sheet__divider" />
				<view class="avatar-sheet__cancel" @click="closeAvatarSheet">
					<text>{{ t('common.cancel') }}</text>
				</view>
			</view>
		</uv-popup>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { icons } from '@/utils/icons'
import PageHeader from '@/components/PageHeader.vue'
import BottomActionBar from '@/components/BottomActionBar.vue'
import LanguagePopupHost from '@/components/LanguagePopupHost.vue'

const { t } = useLocale()
const avatar = ref(icons.profile.avatar)
const nickname = ref('')
const email = ref('')
const avatarSheetRef = ref<{ open: () => void; close: () => void } | null>(null)

const chooseAvatar = () => {
	avatarSheetRef.value?.open()
}

const closeAvatarSheet = () => {
	avatarSheetRef.value?.close()
}

const pickImage = (source: 'camera' | 'album') => {
	closeAvatarSheet()
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: [source],
		success: (res) => {
			avatar.value = res.tempFilePaths[0]
		}
	})
}

const handleSave = () => {
	uni.showToast({ title: t('profile.saveChanges'), icon: 'success' })
	setTimeout(() => uni.navigateBack(), 1000)
}
</script>

<style lang="scss" scoped>
.edit-page {
	min-height: 100vh;
	background: linear-gradient(180deg, #F8F9FF 0%, #FFFFFF 100%);
	padding-bottom: calc(202rpx + env(safe-area-inset-bottom));
}

.edit-body {
	height: calc(100vh - 128rpx - 202rpx - env(safe-area-inset-top) - env(safe-area-inset-bottom));
	box-sizing: border-box;
}

.avatar-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 32rpx 0;
}

.avatar-section__wrap {
	position: relative;
	width: 256rpx;
	height: 256rpx;
}

.avatar-section__glow {
	position: absolute;
	inset: 0;
	border-radius: 9999rpx;
	background: linear-gradient(45deg, rgba(220, 233, 255, 1) 0%, rgba(205, 224, 253, 1) 100%);
	filter: blur(48rpx);
	opacity: 0.3;
}

.avatar-section__ring {
	position: relative;
	width: 256rpx;
	height: 256rpx;
	border-radius: 9999rpx;
	border: 8rpx solid #EFF4FF;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
	overflow: hidden;
	box-sizing: border-box;
}

.avatar-section__image {
	width: 100%;
	height: 100%;
	border-radius: 9999rpx;
}

.avatar-section__camera {
	position: absolute;
	right: 0;
	bottom: 0;
	width: 80rpx;
	height: 80rpx;
	border-radius: 9999rpx;
	background: #CDE0FD;
	border: 4rpx solid #EFF4FF;
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
}

.avatar-section__camera-icon {
	width: 34rpx;
	height: 30rpx;
}

.avatar-section__hint {
	margin-top: 32rpx;
	font-size: 24rpx;
	font-weight: 500;
	color: #979797;
	letter-spacing: 0.1em;
	text-transform: uppercase;
}

.edit-card {
	margin: 0 32rpx;
	padding: 46rpx 48rpx;
	background: #fff;
	border: 1rpx solid #C2C6D6;
	border-radius: 24rpx;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
	display: flex;
	flex-direction: column;
	gap: 46rpx;
	box-sizing: border-box;
}

.field__label {
	display: block;
	font-size: 24rpx;
	font-weight: 500;
	color: #424754;
	margin-bottom: 10rpx;
	padding-left: 8rpx;
	letter-spacing: 0.02em;
}

.field__input {
	border: 1rpx solid #C2C6D6;
	border-radius: 16rpx;
	padding: 22rpx 32rpx;
	background: #fff;
	box-sizing: border-box;

	input {
		width: 100%;
		font-size: 32rpx;
		color: #0B1C30;
	}
}

.placeholder {
	color: #6B7280;
}

.avatar-sheet {
	background: #FFFFFF;
	border-radius: 24rpx 24rpx 0 0;
	padding-bottom: env(safe-area-inset-bottom);
	box-shadow: 0 -8rpx 40rpx rgba(0, 0, 0, 0.08);
}

.avatar-sheet__item {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 32rpx;

	text {
		font-size: 32rpx;
		font-weight: 400;
		color: #333333;
		line-height: 1.5;
		text-align: center;
	}
}

.avatar-sheet__divider {
	height: 1rpx;
	background: #DDDDDD;
}

.avatar-sheet__cancel {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 32rpx 32rpx 40rpx;

	text {
		font-size: 32rpx;
		font-weight: 400;
		color: #0058BE;
		line-height: 1.5;
		text-align: center;
	}
}
</style>
