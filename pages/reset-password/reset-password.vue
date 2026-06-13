<template>
	<view class="auth-page">
		<view class="auth-page__lang"><LanguageSwitcher /></view>
		<view class="auth-page__content">
			<view class="auth-page__brand"><BrandLogo show-tagline /></view>
			<view class="auth-card">
				<text class="auth-card__title">{{ t('resetPassword.title') }}</text>
				<view class="auth-form">
					<view class="field">
						<text class="field__label">{{ t('resetPassword.email') }}</text>
						<view class="field__input field__input--filled">
							<input v-model="email" :placeholder="t('resetPassword.emailPlaceholder')" placeholder-class="placeholder" />
						</view>
					</view>
					<view class="field">
						<text class="field__label">{{ t('resetPassword.verifyCode') }}</text>
						<view class="field__input field__input--code">
							<input v-model="code" :placeholder="t('resetPassword.codePlaceholder')" placeholder-class="placeholder" />
							<text class="field__code-btn" @click="getCode">{{ countdown > 0 ? `${countdown}s` : t('resetPassword.getCode') }}</text>
						</view>
					</view>
					<view class="field">
						<text class="field__label">{{ t('resetPassword.newPassword') }}</text>
						<view class="field__input field__input--password">
							<input
								v-model="password"
								:type="showPassword ? 'text' : 'password'"
								:placeholder="t('resetPassword.passwordPlaceholder')"
								placeholder-class="placeholder"
							/>
							<view class="field__eye" @click="showPassword = !showPassword">
								<uv-icon :name="showPassword ? icons.eyeOpen : icons.eyeClose" size="18"></uv-icon>
							</view>
						</view>
					</view>
					<view class="submit-btn" @click="handleReset">
						<text>{{ t('resetPassword.submit') }}</text>
					</view>
				</view>
			</view>
			<view class="auth-footer">
				<text class="link" @click="goLogin">{{ t('resetPassword.rememberPassword') }}</text>
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
const { resetPassword, sendVerificationCode, loading } = useAuth()

const email = ref('')
const code = ref('')
const password = ref('')
const showPassword = ref(false)
const countdown = ref(0)
let countdownTimer: number | null = null

const getCode = async () => {
	if (!email.value) {
		uni.showToast({ title: t('resetPassword.emailPlaceholder'), icon: 'none' })
		return
	}
	
	// 检查邮箱格式
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!emailRegex.test(email.value)) {
		uni.showModal({
			title: t('resetPassword.emailFormatErrorTitle'),
			content: t('resetPassword.emailFormatErrorContent'),
			showCancel: false,
			confirmText: t('resetPassword.confirm')
		})
		return
	}
	
	// 检查是否为谷歌邮箱
	if (!email.value.endsWith('@gmail.com')) {
		uni.showModal({
			title: t('resetPassword.emailErrorTitle'),
			content: t('resetPassword.emailErrorContent'),
			showCancel: false,
			confirmText: t('resetPassword.confirm')
		})
		return
	}
	
	if (countdown.value > 0) return
	
	try {
		await sendVerificationCode(email.value, 'resetpwd')
		uni.showToast({ title: t('resetPassword.codeSent'), icon: 'success' })
		
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

const handleReset = async () => {
	if (!email.value) {
		uni.showToast({ title: t('resetPassword.emailPlaceholder'), icon: 'none' })
		return
	}
	
	if (!code.value) {
		uni.showToast({ title: t('resetPassword.codePlaceholder'), icon: 'none' })
		return
	}
	
	if (!password.value) {
		uni.showToast({ title: t('resetPassword.passwordPlaceholder'), icon: 'none' })
		return
	}
	
	if (password.value.length < 6 || password.value.length > 30) {
		uni.showToast({ title: t('resetPassword.passwordLengthError'), icon: 'none' })
		return
	}
	
	try {
		await resetPassword({
			email: email.value,
			newpassword: password.value,
			captcha: code.value
		})
		
		uni.showToast({ title: t('resetPassword.success'), icon: 'success' })
		setTimeout(() => {
			uni.redirectTo({ url: '/pages/login/login' })
		}, 1500)
	} catch (error) {
		console.error('重置密码失败:', error)
	}
}

const goLogin = () => uni.navigateBack()
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
</style>
