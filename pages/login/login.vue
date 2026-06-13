<template>
	<view class="login-page">
		<view class="login-page__lang">
			<LanguageSwitcher />
		</view>
		<view class="login-page__content">
			<view class="login-page__brand">
				<BrandLogo show-tagline />
			</view>
			<view class="login-card">
				<view class="login-tabs">
					<view class="login-tabs__item" :class="{ active: activeTab === 'code' }"
						@click="activeTab = 'code'">
						<text>{{ t('login.codeTab') }}</text>
					</view>
					<view class="login-tabs__item" :class="{ active: activeTab === 'password' }"
						@click="activeTab = 'password'">
						<text>{{ t('login.passwordTab') }}</text>
					</view>
				</view>
				<view class="login-form">
					<view class="field">
						<text class="field__label">{{ t('login.email') }}</text>
						<view class="field__input field__input--filled">
							<input v-model="email" type="text" :placeholder="t('login.emailPlaceholder')"
								placeholder-class="placeholder" />
						</view>
					</view>
					<view v-if="activeTab === 'code'" class="field">
						<text class="field__label">{{ t('login.verifyCode') }}</text>
						<view class="field__input field__input--code">
							<input v-model="code" type="text" :placeholder="t('login.codePlaceholder')"
								placeholder-class="placeholder" />
							<text class="field__code-btn" @click="getCode">{{ countdown > 0 ? `${countdown}s` : t('login.getCode') }}</text>
						</view>
					</view>
					<view v-if="activeTab === 'password'" class="field">
						<text class="field__label">{{ t('login.password') }}</text>
						<view class="field__input field__input--password">
							<input
								v-model="password"
								:type="showPassword ? 'text' : 'password'"
								:placeholder="t('login.passwordPlaceholder')"
								placeholder-class="placeholder"
							/>
							<view class="field__eye" @click="showPassword = !showPassword">
								<uv-icon :name="showPassword ? icons.eyeOpen : icons.eyeClose" size="18"></uv-icon>
							</view>
						</view>
						<text class="field__link" @click="goReset">{{ t('login.forgotPassword') }}</text>
					</view>
					<view class="agreement" @click="agreed = !agreed">
						<view class="agreement__check" :class="{ checked: agreed }">
							<uv-icon v-if="agreed" name="checkmark" color="#fff" size="12"></uv-icon>
						</view>
						<text class="agreement__text" @click.stop="goAgreement">{{ t('login.agreement') }}</text>
					</view>
					<view class="submit-btn" @click="handleLogin">
						<text>{{ t('login.submit') }}</text>
					</view>

					<!-- 用户协议弹出框 -->
					<uv-popup ref="agreementPopupRef" mode="center" :round="16" :closeOnClickOverlay="false">
						<view class="agreement-popup">
							<view class="agreement-popup__header">
								<text class="agreement-popup__title">{{ t('login.agreementPopupTitle') }}</text>
							</view>
							<scroll-view scroll-y class="agreement-popup__content">
								<text class="agreement-popup__text">{{ t('login.agreementPopupContent') }}</text>
							</scroll-view>
							<view class="agreement-popup__footer">
								<view class="agreement-popup__btn agreement-popup__btn--cancel" @click="closeAgreementPopup">
									<text>{{ t('login.disagree') }}</text>
								</view>
								<view class="agreement-popup__btn agreement-popup__btn--confirm" @click="confirmAgreement">
									<text>{{ t('login.agree') }}</text>
								</view>
							</view>
						</view>
					</uv-popup>
				</view>
			</view>
			<view class="login-footer">
				<text>{{ t('login.noAccount') }} </text>
				<text class="link" @click="goRegister">{{ t('login.registerNow') }}</text>
			</view>
		</view>
		<LanguagePopupHost />
	</view>
</template>

<script setup lang="ts">
	import { ref } from 'vue'
	import { useLocale } from '@/composables/useLocale'
	import { useAuth } from '@/composables/useAuth'
	import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
	import BrandLogo from '@/components/BrandLogo.vue'
	import { icons } from '@/utils/icons'
	import LanguagePopupHost from '@/components/LanguagePopupHost.vue'

	const { t } = useLocale()
	const { login, emailLogin, sendVerificationCode, loading } = useAuth()
	
	const activeTab = ref<'code' | 'password'>('code')
	const email = ref('')
	const code = ref('')
	const password = ref('')
	const agreed = ref(false)
	const showPassword = ref(false)
	const countdown = ref(0)
	let countdownTimer: number | null = null
	const agreementPopupRef = ref()
	const pendingLogin = ref(false)

	const getCode = async () => {
		if (!email.value) {
			uni.showToast({ title: t('login.emailPlaceholder'), icon: 'none' })
			return
		}
		
		// 检查邮箱格式
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email.value)) {
			uni.showModal({
				title: t('login.emailFormatErrorTitle'),
				content: t('login.emailFormatErrorContent'),
				showCancel: false,
				confirmText: t('login.confirm')
			})
			return
		}
		
		// 检查是否为谷歌邮箱
		if (!email.value.endsWith('@gmail.com')) {
			uni.showModal({
				title: t('login.emailErrorTitle'),
				content: t('login.emailErrorContent'),
				showCancel: false,
				confirmText: t('login.confirm')
			})
			return
		}
		
		if (countdown.value > 0) return
		
		try {
			await sendVerificationCode(email.value, 'emaillogin')
			uni.showToast({ title: t('login.codeSent'), icon: 'success' })
			
			// 开始倒计时
			countdown.value = 60
			countdownTimer = setInterval(() => {
				countdown.value--
				if (countdown.value <= 0) {
					if (countdownTimer) clearInterval(countdownTimer)
				}
			}, 1000)
		} catch (error) {
			console.error('发送验证码失败:', error)
		}
	}

	const handleLogin = async () => {
		if (!email.value) {
			uni.showToast({ title: t('login.emailPlaceholder'), icon: 'none' })
			return
		}
		
		try {
			if (activeTab.value === 'code') {
				// 邮箱验证码登录
				if (!code.value) {
					uni.showToast({ title: t('login.codePlaceholder'), icon: 'none' })
					return
				}
			} else {
				// 密码登录
				if (!password.value) {
					uni.showToast({ title: t('login.passwordPlaceholder'), icon: 'none' })
					return
				}
			}
			
			// 如果没有勾选协议，弹出协议窗口
			if (!agreed.value) {
				pendingLogin.value = true
				agreementPopupRef.value?.open()
				return
			}
			
			if (activeTab.value === 'code') {
				await emailLogin({ email: email.value, captcha: code.value })
			} else {
				await login({ account: email.value, password: password.value })
			}
			
			uni.reLaunch({ url: '/pages/home/home' })
		} catch (error) {
			console.error('登录失败:', error)
		}
	}

	const closeAgreementPopup = () => {
		agreementPopupRef.value?.close()
		pendingLogin.value = false
	}

	const confirmAgreement = () => {
		agreed.value = true
		agreementPopupRef.value?.close()
		
		// 如果是待登录状态，继续登录流程
		if (pendingLogin.value) {
			pendingLogin.value = false
			handleLogin()
		}
	}

	const goRegister = () => uni.navigateTo({ url: '/pages/register/register' })
	const goReset = () => uni.navigateTo({ url: '/pages/reset-password/reset-password' })
	const goAgreement = () => {
		uni.navigateTo({
			url: '/pages/user-agreement/user-agreement',
			events: {
				agree: () => {
					agreed.value = true
				}
			}
		})
	}
</script>

<style lang="scss" scoped>
	.login-page {
		min-height: 100vh;
		position: relative;
		background: #DAE6F3;

	}

	.login-page__lang {
		position: absolute;
		top: calc(64rpx + env(safe-area-inset-top));
		right: 32rpx;
		z-index: 100;
	}

	.login-page__content {
		padding: 128rpx 32rpx 64rpx;
	}

	.login-page__brand {
		margin-bottom: 80rpx;
	}

	.login-card {
		background: #fff;
		border: 1rpx solid #C2C6D6;
		border-radius: 24rpx;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
		padding: 48rpx;
	}

	.login-tabs {
		display: flex;
		border-bottom: 1rpx solid #C2C6D6;
		margin-bottom: 48rpx;
	}

	.login-tabs__item {
		flex: 1;
		text-align: center;
		padding: 18rpx 0 44rpx;
		border-bottom: 4rpx solid transparent;

		text {
			font-size: 28rpx;
			font-weight: 500;
			color: #424754;
		}

		&.active {
			border-bottom-color: #0058BE;

			text {
				color: #0058BE;
			}
		}
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: 48rpx;
	}

	.field__label {
		display: block;
		font-size: 24rpx;
		font-weight: 500;
		color: #424754;
		margin-bottom: 16rpx;
		padding-left: 8rpx;
	}

	.field__input {
		display: flex;
		align-items: center;
		border: 1rpx solid #C2C6D6;
		border-radius: 16rpx;
		padding: 22rpx 32rpx;
		background: #fff;

		&--filled {
			background: #EFF4FF;
		}

		&--code {
			padding-right: 16rpx;

			input {
				flex: 1;
			}
		}

		&--password {
			padding-right: 16rpx;

			input {
				flex: 1;
			}
		}

		input {
			flex: 1;
			font-size: 32rpx;
			color: #0B1C30;
		}
	}

	.placeholder {
		color: #727785;
	}

	.field__code-btn {
		font-size: 28rpx;
		font-weight: 500;
		color: #0058BE;
		padding: 16rpx;
		white-space: nowrap;
	}

	.field__eye {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 8rpx;
	}

	.field__link {
		display: block;
		text-align: right;
		font-size: 24rpx;
		color: #0058BE;
		margin-top: 12rpx;
	}

	.agreement {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.agreement__check {
		width: 32rpx;
		height: 32rpx;
		border: 1rpx solid #C2C6D6;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		&.checked {
			background: #0058BE;
			border-color: #0058BE;
		}
	}

	.agreement__text {
		font-size: 24rpx;
		color: #0058BE;
	}

	.link {
		color: #0058BE;
	}

	.submit-btn {
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

	.login-footer {
		text-align: center;
		margin-top: 80rpx;
		font-size: 28rpx;
		color: #424754;
	}

	.agreement-popup {
		width: 520rpx;
		background: #fff;
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
	}

	.agreement-popup__header {
		padding: 20rpx 24rpx;
		text-align: center;
		border-bottom: 1rpx solid #E5E7EB;
		background: #F8F9FF;
	}

	.agreement-popup__title {
		font-size: 30rpx;
		font-weight: 600;
		color: #0058BE;
	}

	.agreement-popup__content {
		height: 180rpx;
		padding: 20rpx 24rpx;
		background: #fff;
	}

	.agreement-popup__text {
		font-size: 26rpx;
		line-height: 1.6;
		color: #424754;
		text-align: center;
	}

	.agreement-popup__footer {
		display: flex;
		border-top: 1rpx solid #E5E7EB;
		background: #F8F9FF;
	}

	.agreement-popup__btn {
		flex: 1;
		padding: 24rpx;
		text-align: center;
		font-size: 28rpx;
		font-weight: 500;
		
		&--cancel {
			color: #6B7280;
			border-right: 1rpx solid #E5E7EB;
			background: #fff;
		}
		
		&--confirm {
			color: #fff;
			background: #0058BE;
		}
	}
</style>