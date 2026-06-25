<template>
	<view class="profile-page">
		<PageLoading :visible="pageLoading" type="profile" />
		<view class="profile-header">
			<BrandLogo />
			<LanguageSwitcher />
		</view>
		<PullRefresh class="profile-body" :refresh="handleRefresh">
			<view class="profile-card">
				<view class="profile-card__avatar-wrap">
					<image class="profile-card__avatar" :src="getImageUrl(displayAvatar)" mode="aspectFill" />
				</view>
				<view class="profile-card__info">
					<text class="profile-card__name">{{ displayName }}</text>
					<text class="profile-card__email">{{ displayEmail }}</text>
				</view>
			</view>

			<view class="menu-list">
				<view v-for="(item, index) in menuItems" :key="item.key" class="menu-item"
					:class="{ 'menu-item--bordered': index > 0 }" @click="handleMenu(item)">
					<view class="menu-item__left">
						<view class="menu-item__icon-wrap">
							<image class="menu-item__icon" :src="getImageUrl(item.icon)" mode="aspectFit" />
							<view v-if="item.badge" class="menu-item__badge" />
						</view>
						<text class="menu-item__label">{{ t(item.labelKey) }}</text>
					</view>
					<image class="menu-item__arrow" :src="getImageUrl(icons.profile.arrow)" mode="aspectFit" />
				</view>
			</view>

			<!-- 已登录：退出登录按钮 -->
			<view v-if="isLoggedIn" class="logout-btn" @click="handleLogout">
				<text class="logout-btn__text">{{ logoutLoading ? t('common.loading') : t('profile.logout') }}</text>
			</view>
			<!-- 未登录：立即登录按钮 -->
			<view v-else class="login-now-btn" @click="goLogin">
				<text class="login-now-btn__text">{{ t('profile.loginNow') }}</text>
			</view>
		</PullRefresh>
		<AppTabBar current="profile" />
		<LanguagePopupHost />
		<ContactPopupHost />
	</view>
</template>

<script setup lang="ts">
	import { ref, computed, onMounted } from 'vue'
	import { onShow } from '@dcloudio/uni-app'
	import { useLocale } from '@/composables/useLocale'
	import { useContactPopup } from '@/composables/useContactPopup'
	import { useUserProfile } from '@/composables/useUserProfile'
	import { useAuth } from '@/composables/useAuth'
	import { getImageUrl } from '@/src/config/env'
	import BrandLogo from '@/components/BrandLogo.vue'
	import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
	import AppTabBar from '@/components/AppTabBar.vue'
	import PullRefresh from '@/components/PullRefresh.vue'
	import { icons } from '@/utils/icons'
	import LanguagePopupHost from '@/components/LanguagePopupHost.vue'
	import ContactPopupHost from '@/components/ContactPopupHost.vue'
	import PageLoading from '@/components/PageLoading.vue'

	const { t } = useLocale()
	const { openContactPopup } = useContactPopup()
	const { userProfile, fetchUserProfile, loading } = useUserProfile()
	const { logout } = useAuth()

	const logoutLoading = ref(false)
	const pageLoading = ref(true)
	const isLoggedIn = ref(false)

	const notificationBadge = ref(false)

	onMounted(async () => {
		const token = uni.getStorageSync('token')
		isLoggedIn.value = !!token
		console.log('[DEBUG][Profile] onMounted - token:', token ? '有token' : '无token', '| isLoggedIn:', isLoggedIn.value)
		if (isLoggedIn.value) {
			try {
				await fetchUserProfile()
				console.log('[DEBUG][Profile] onMounted - 用户资料:', JSON.stringify(userProfile.value))
			} catch (error) {
				console.error('[DEBUG][Profile] onMounted - 获取用户资料失败:', error)
			}
		}
		pageLoading.value = false
		console.log('[DEBUG][Profile] onMounted - 页面加载完成')
	})

	onShow(async () => {
		const token = uni.getStorageSync('token')
		isLoggedIn.value = !!token
		console.log('[DEBUG][Profile] onShow - token:', token ? '有token' : '无token', '| isLoggedIn:', isLoggedIn.value)
		if (isLoggedIn.value) {
			try {
				await fetchUserProfile()
				console.log('[DEBUG][Profile] onShow - 用户资料:', JSON.stringify(userProfile.value))
			} catch (error) {
				console.error('[DEBUG][Profile] onShow - 刷新用户资料失败:', error)
			}
		}
	})

	const handleRefresh = async () => {
		console.log('[DEBUG][Profile] handleRefresh - 下拉刷新触发')
		if (isLoggedIn.value) {
			await fetchUserProfile()
			console.log('[DEBUG][Profile] handleRefresh - 刷新后用户资料:', JSON.stringify(userProfile.value))
		}
	}

	// 使用API数据或默认值，只在数据加载完成后显示
	const displayName = computed(() => {
		const name = (!userProfile.value) ? t('profile.userName') : (userProfile.value.nickname || t('profile.userName'))
		console.log('[DEBUG][Profile] displayName computed:', name, '| userProfile:', JSON.stringify(userProfile.value))
		return name
	})
	const displayEmail = computed(() => {
		const email = (!userProfile.value) ? t('profile.userEmail') : (userProfile.value.email || t('profile.userEmail'))
		console.log('[DEBUG][Profile] displayEmail computed:', email)
		return email
	})
	const displayAvatar = computed(() => {
		const avatar = (!userProfile.value) ? icons.profile.avatar : (userProfile.value.avatar || icons.profile.avatar)
		console.log('[DEBUG][Profile] displayAvatar computed:', avatar)
		return avatar
	})

	const menuItems = computed(() => [
		{
			key: 'edit',
			labelKey: 'profile.editProfile',
			icon: icons.profile.edit,
			path: '/pages/profile/edit'
		},
		{
			key: 'history',
			labelKey: 'profile.usageHistory',
			icon: icons.profile.history,
			path: '/pages/order/list',
			reLaunch: true
		},
		{
			key: 'notifications',
			labelKey: 'profile.notificationCenter',
			icon: icons.profile.notification,
			path: '/pages/message/list',
			reLaunch: true,
			badge: notificationBadge.value
		},
		{
			key: 'contact',
			labelKey: 'profile.contact',
			icon: icons.profile.contact,
			action: 'contact'
		}
	])

	const handleMenu = (item : (typeof menuItems.value)[0]) => {
		console.log('[DEBUG][Profile] handleMenu - 点击菜单:', item.key, '| isLoggedIn:', isLoggedIn.value)
		// 未登录时拦截，提示先登录
		if (!isLoggedIn.value) {
			uni.showModal({
				title: t('profile.loginRequired'),
				content: t('profile.loginRequiredDesc'),
				showCancel: true,
				cancelText: t('common.cancel'),
				confirmText: t('profile.loginNow'),
				confirmColor: '#16A34A',
				success: (res) => {
					if (res.confirm) goLogin()
				}
			})
			return
		}
		if (item.action === 'contact') {
			openContactPopup()
			return
		}
		if (item.path) {
			if (item.reLaunch) {
				uni.reLaunch({ url: item.path })
			} else {
				uni.navigateTo({ url: item.path })
			}
		}
	}

	const goLogin = () => {
		uni.navigateTo({ url: '/pages/login/login' })
	}

	const handleLogout = () => {
		uni.showModal({
			title: t('profile.logout'),
			content: t('profile.logoutConfirm'),
			confirmText: t('profile.logout'),
			cancelText: t('common.cancel'),
			confirmColor: '#D40000',
			success: async (res) => {
				if (res.confirm) {
					logoutLoading.value = true
					await logout()
					logoutLoading.value = false
					uni.reLaunch({ url: '/pages/home/home' })
				}
			}
		})
	}
</script>

<style lang="scss" scoped>
	.profile-page {
		min-height: 100vh;
		background: #DAE6F3;
		display: flex;
		flex-direction: column;
		padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
	}

	.profile-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 32rpx;
		padding-top: calc(env(safe-area-inset-top));
		height: calc(128rpx + env(safe-area-inset-top));
		box-sizing: border-box;
		background: rgba(255, 255, 255, 0.8);
		border-bottom: 1rpx solid #C2C6D6;
		backdrop-filter: blur(24rpx);
	}

	.profile-body {
		flex: 1;
		min-height: 0;
		height: 0;
		padding: 32rpx;
		box-sizing: border-box;
	}

	.profile-card {
		display: flex;
		align-items: center;
		gap: 24rpx;
		height: 152rpx;
		padding: 0 44rpx;
		background: #fff;
		border: 1rpx solid #EAF1FF;
		border-radius: 32rpx;
		box-shadow: 0 8rpx 40rpx -8rpx rgba(0, 88, 190, 0.03);
		margin-bottom: 32rpx;
		box-sizing: border-box;
	}

	.profile-card__avatar-wrap {
		flex-shrink: 0;
		width: 100rpx;
		height: 100rpx;
		border-radius: 9999rpx;
		box-shadow: 0 0 0 8rpx #EFF4FF;
		overflow: hidden;
	}

	.profile-card__avatar {
		width: 100%;
		height: 100%;
		border-radius: 9999rpx;
		background: #F5A623;
	}

	.profile-card__info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 8rpx;
	}

	.profile-card__name {
		font-size: 40rpx;
		font-weight: 600;
		color: #0B1C30;
		line-height: 1.4;
		font-family: Inter, sans-serif;
		letter-spacing: -0.03em;
	}

	.profile-card__email {
		font-size: 24rpx;
		font-weight: 400;
		color: #9C9C9C;
		line-height: 1.4;
	}

	.menu-list {
		background: #fff;
		border: 1rpx solid #EAF1FF;
		border-radius: 32rpx;
		box-shadow: 0 8rpx 40rpx -8rpx rgba(0, 88, 190, 0.03);
		overflow: hidden;
	}

	.menu-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 48rpx;
		box-sizing: border-box;

		&--bordered {
			border-top: 1rpx solid rgba(229, 238, 255, 0.3);
		}
	}

	.menu-item__left {
		display: flex;
		align-items: center;
		gap: 40rpx;
		flex: 1;
		min-width: 0;
	}

	.menu-item__icon-wrap {
		position: relative;
		flex-shrink: 0;
		width: 80rpx;
		height: 80rpx;
		border-radius: 9999rpx;
		background: rgba(216, 226, 255, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.menu-item__icon {
		width: 40rpx;
		height: 40rpx;
	}

	.menu-item__badge {
		position: absolute;
		top: 6rpx;
		right: 6rpx;
		width: 20rpx;
		height: 20rpx;
		border-radius: 9999rpx;
		background: #D40000;
		border: 2rpx solid #fff;
		box-sizing: border-box;
	}

	.menu-item__label {
		flex: 1;
		min-width: 0;
		font-size: 32rpx;
		font-weight: 400;
		color: #0B1C30;
		line-height: 1.4;
		letter-spacing: 0.02em;
		word-wrap: break-word;
		overflow-wrap: break-word;
		white-space: normal;
	}

	.menu-item__arrow {
		flex-shrink: 0;
		width: 14rpx;
		height: 24rpx;
		margin-left: 16rpx;
	}

	.logout-btn {
		margin-top: 32rpx;
		height: 96rpx;
		background: #fff;
		border: 1rpx solid #FFCDD2;
		border-radius: 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.logout-btn__text {
		font-size: 32rpx;
		font-weight: 500;
		color: #D40000;
		line-height: 1.4;
	}

	.login-now-btn {
		margin-top: 32rpx;
		height: 96rpx;
		background: transparent;
		border: 2rpx solid #16A34A;
		border-radius: 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.login-now-btn__text {
		font-size: 32rpx;
		font-weight: 500;
		color: #16A34A;
		line-height: 1.4;
	}
</style>