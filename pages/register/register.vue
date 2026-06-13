<template>
	<view class="auth-page">
		<view class="auth-page__lang"><LanguageSwitcher /></view>
		<view class="auth-page__content">
			<view class="auth-page__brand"><BrandLogo show-tagline /></view>
			<view class="auth-card">
				<text class="auth-card__title">{{ t('register.title') }}</text>
				<view class="auth-form">
					<view class="field">
						<text class="field__label">{{ t('register.email') }}</text>
						<view class="field__input field__input--filled">
							<input v-model="email" :placeholder="t('register.emailPlaceholder')" placeholder-class="placeholder" />
						</view>
					</view>
					<view class="field">
						<text class="field__label">{{ t('register.verifyCode') }}</text>
						<view class="field__input field__input--code">
							<input v-model="code" :placeholder="t('register.codePlaceholder')" placeholder-class="placeholder" />
							<text class="field__code-btn" @click="getCode">{{ countdown > 0 ? `${countdown}s` : t('register.getCode') }}</text>
						</view>
					</view>
					<view class="field">
						<text class="field__label">{{ t('register.setPassword') }}</text>
						<view class="field__input field__input--password">
							<input
								v-model="password"
								:type="showPassword ? 'text' : 'password'"
								:placeholder="t('register.passwordPlaceholder')"
								placeholder-class="placeholder"
							/>
							<view class="field__eye" @click="showPassword = !showPassword">
								<uv-icon :name="showPassword ? icons.eyeOpen : icons.eyeClose" size="18"></uv-icon>
							</view>
						</view>
					</view>
					<view class="agreement" @click="agreed = !agreed">
						<view class="agreement__check" :class="{ checked: agreed }">
							<uv-icon v-if="agreed" name="checkmark" color="#fff" size="12"></uv-icon>
						</view>
						<text class="agreement__text link" @click.stop="goAgreement">{{ t('register.agreement') }}</text>
					</view>
					<view class="submit-btn" @click="handleRegister">
						<text>{{ t('register.submit') }}</text>
					</view>

					<!-- 用户协议弹出框 -->
					<uv-popup ref="agreementPopupRef" mode="center" :round="16" :closeOnClickOverlay="false">
						<view class="agreement-popup">
							<view class="agreement-popup__header">
								<text class="agreement-popup__title">{{ t('register.agreementPopupTitle') }}</text>
							</view>
							<scroll-view scroll-y class="agreement-popup__content">
								<text class="agreement-popup__text">{{ t('register.agreementPopupContent') }}</text>
							</scroll-view>
							<view class="agreement-popup__footer">
								<view class="agreement-popup__btn agreement-popup__btn--cancel" @click="closeAgreementPopup">
									<text>{{ t('register.disagree') }}</text>
								</view>
								<view class="agreement-popup__btn agreement-popup__btn--confirm" @click="confirmAgreement">
									<text>{{ t('register.agree') }}</text>
								</view>
							</view>
						</view>
					</uv-popup>
				</view>
			</view>
			<view class="auth-footer">
				<text>{{ t('register.hasAccount') }} </text>
				<text class="link" @click="goLogin">{{ t('register.loginNow') }}</text>
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
const { register, sendVerificationCode, loading } = useAuth()

const email = ref('')
const code = ref('')
const password = ref('')
const agreed = ref(false)
const showPassword = ref(false)
const countdown = ref(0)
let countdownTimer: number | null = null
const agreementPopupRef = ref()
const pendingRegister = ref(false)

const getCode = async () => {
	if (!email.value) {
		uni.showToast({ title: t('register.emailPlaceholder'), icon: 'none' })
		return
	}
	
	// 检查邮箱格式
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!emailRegex.test(email.value)) {
		uni.showModal({
			title: t('register.emailFormatErrorTitle'),
			content: t('register.emailFormatErrorContent'),
			showCancel: false,
			confirmText: t('register.confirm')
		})
		return
	}
	
	// 检查是否为谷歌邮箱
	if (!email.value.endsWith('@gmail.com')) {
		uni.showModal({
			title: t('register.emailErrorTitle'),
			content: t('register.emailErrorContent'),
			showCancel: false,
			confirmText: t('register.confirm')
		})
		return
	}
	
	if (countdown.value > 0) return
	
	try {
		await sendVerificationCode(email.value, 'register')
		uni.showToast({ title: t('register.codeSent'), icon: 'success' })
		
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

const handleRegister = async () => {
	if (!email.value) {
		uni.showToast({ title: t('register.emailPlaceholder'), icon: 'none' })
		return
	}
	
	if (!code.value) {
		uni.showToast({ title: t('register.codePlaceholder'), icon: 'none' })
		return
	}
	
	if (!password.value) {
		uni.showToast({ title: t('register.passwordPlaceholder'), icon: 'none' })
		return
	}
	
	if (password.value.length < 6 || password.value.length > 30) {
		uni.showToast({ title: t('register.passwordLengthError'), icon: 'none' })
		return
	}
	
	// 如果没有勾选协议，弹出协议窗口
	if (!agreed.value) {
		pendingRegister.value = true
		agreementPopupRef.value?.open()
		return
	}
	
	try {
		await register({
			email: email.value,
			password: password.value,
			captcha: code.value,
			agreement: '1'
		})
		
		uni.showToast({ title: t('register.success'), icon: 'success' })
		setTimeout(() => {
			uni.redirectTo({ url: '/pages/login/login' })
		}, 1500)
	} catch (error) {
		console.error('注册失败:', error)
	}
}

const closeAgreementPopup = () => {
	agreementPopupRef.value?.close()
	pendingRegister.value = false
}

const confirmAgreement = () => {
	agreed.value = true
	agreementPopupRef.value?.close()
	
	// 如果是待注册状态，继续注册流程
	if (pendingRegister.value) {
		pendingRegister.value = false
		handleRegister()
	}
}

const goLogin = () => uni.navigateBack()
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
@import '@/styles/auth-common.scss';
.auth-card__title {
	display: block;
	text-align: center;
	font-size: 36rpx;
	font-weight: 500;
	color: #0B1C30;
	margin-bottom: 48rpx;
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
