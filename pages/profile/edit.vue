<template>
	<view class="edit-page">
		<PageHeader
			hide-title
			show-lang
			class
			back-color="#0058BE"
			background="rgba(248, 249, 255, 0.8)"
		/>
		<scroll-view scroll-y class="edit-body" :show-scrollbar="false" v-if="!loading">
			<view class="avatar-section" @click="chooseAvatar">
				<view class="avatar-section__wrap">
					<view class="avatar-section__glow" />
					<view class="avatar-section__ring">
						<image class="avatar-section__image" :src="getImageUrl(avatar)" mode="aspectFill" />
					</view>
					<view class="avatar-section__camera">
						<image class="avatar-section__camera-icon" :src="getImageUrl(icons.profile.camera)" mode="aspectFit" />
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
							:maxlength="20"
						/>
						<text class="field__char-count">{{ nickname.length }}/20</text>
					</view>
				</view>
				<view class="field">
					<text class="field__label">{{ t('profile.email') }}</text>
					<view class="field__input field__input--readonly">
						<text class="field__readonly-text">{{ email }}</text>
					</view>
				</view>
				<view class="field">
					<text class="field__label">{{ t('profile.bio') }}</text>
					<view class="field__textarea">
						<textarea
							v-model="bio"
							:placeholder="t('profile.bioPlaceholder')"
							placeholder-class="placeholder"
							:maxlength="200"
						/>
						<text class="field__char-count">{{ bio.length }}/200</text>
					</view>
				</view>
			</view>
		</scroll-view>
		<view v-if="loading" class="loading-container">
			<view class="loading-spinner" />
			<text class="loading-text">{{ t('common.loading') }}</text>
		</view>
		<BottomActionBar :text="t('profile.saveChanges')" @click="handleSave" v-if="!loading" />
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
import { ref, onMounted } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { useUserProfile } from '@/composables/useUserProfile'
import { getImageUrl } from '@/src/config/env'
import { icons } from '@/utils/icons'
import api from '@/utils/api'
import PageHeader from '@/components/PageHeader.vue'
import BottomActionBar from '@/components/BottomActionBar.vue'
import LanguagePopupHost from '@/components/LanguagePopupHost.vue'

const { t } = useLocale()
const { userProfile, fetchUserProfile, updateUserProfile, loading } = useUserProfile()

const avatar = ref(userProfile.value?.avatar || icons.profile.avatar)
const nickname = ref(userProfile.value?.nickname || '')
const email = ref(userProfile.value?.email || '')
const bio = ref(userProfile.value?.bio || '')
const avatarSheetRef = ref<{ open: () => void; close: () => void } | null>(null)

onMounted(async () => {
	try {
		// 总是获取最新数据，确保显示正确
		await fetchUserProfile()
		console.log('用户资料数据:', userProfile.value)
		if (userProfile.value) {
			nickname.value = userProfile.value.nickname || ''
			email.value = userProfile.value.email || ''
			bio.value = userProfile.value.bio || ''
			avatar.value = userProfile.value.avatar || icons.profile.avatar
			console.log('bio值:', bio.value)
		}
	} catch (error) {
		console.error('获取用户资料失败:', error)
	}
})

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
			const tempFilePath = res.tempFilePaths[0]
			
			// 显示加载提示
			uni.showLoading({ title: t('common.uploading'), mask: true })
			
			// 使用 uni.uploadFile 上传文件
			uni.uploadFile({
				url: (import.meta.env.VITE_BASE_URL || 'https://cs.forward-hub-japan.com') + '/api/common/upload',
				filePath: tempFilePath,
				name: 'file',
				header: {
					'Authorization': uni.getStorageSync('token') || '',
					token:uni.getStorageSync('token')
				},
				success: (uploadRes) => {
					try {
						const data = JSON.parse(uploadRes.data)
						if (data.data && data.data.url) {
							avatar.value = data.data.url
							uni.showToast({ title: t('profile.uploadSuccess'), icon: 'success' })
						} else {
							uni.showToast({ title: t('profile.uploadFailed'), icon: 'error' })
						}
					} catch (error) {
						console.error('解析上传响应失败:', error)
						uni.showToast({ title: t('profile.uploadFailed'), icon: 'error' })
					}
				},
				fail: (error) => {
					console.error('上传头像失败:', error)
					uni.showToast({ title: t('profile.uploadFailed'), icon: 'error' })
				},
				complete: () => {
					uni.hideLoading()
				}
			})
		}
	})
}

const handleSave = async () => {
	if (!nickname.value.trim()) {
		uni.showToast({ title: t('profile.nicknameRequired'), icon: 'none' })
		return
	}
	
	if (nickname.value.trim().length < 2) {
		uni.showToast({ title: t('profile.nicknameTooShort'), icon: 'none' })
		return
	}
	
	try {
		await updateUserProfile({
			nickname: nickname.value,
			avatar: avatar.value,
			bio: bio.value
		})
		
		// 刷新用户资料以确保同步
		await fetchUserProfile()
		
		uni.showToast({ title: t('profile.saveSuccess'), icon: 'success' })
		setTimeout(() => uni.navigateBack(), 1000)
	} catch (error) {
		console.error('保存用户资料失败:', error)
	}
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
	min-height: 0;
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
	position: relative;

	input {
		width: 100%;
		font-size: 32rpx;
		color: #0B1C30;
	}

	&--readonly {
		background: #F5F6FA;
		border-color: #E0E3EE;
	}
}

.field__readonly-text {
	font-size: 32rpx;
	color: #9C9C9C;
	line-height: 1.5;
}

.field__textarea {
	border: 1rpx solid #C2C6D6;
	border-radius: 16rpx;
	padding: 22rpx 32rpx;
	background: #fff;
	box-sizing: border-box;
	position: relative;

	textarea {
		width: 100%;
		height: 160rpx;
		font-size: 32rpx;
		color: #0B1C30;
		line-height: 1.5;
		resize: none;
	}
}

.field__char-count {
	position: absolute;
	bottom: 16rpx;
	right: 24rpx;
	font-size: 24rpx;
	color: #9C9C9C;
	pointer-events: none;
}

.placeholder {
	color: #6B7280;
}

.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 24rpx;
	height: calc(100vh - 128rpx - env(safe-area-inset-top) - env(safe-area-inset-bottom));
}

.loading-spinner {
	width: 64rpx;
	height: 64rpx;
	border: 6rpx solid #E8EEFF;
	border-top-color: #0058BE;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to   { transform: rotate(360deg); }
}

.loading-text {
	font-size: 28rpx;
	color: #9C9C9C;
	font-weight: 400;
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
