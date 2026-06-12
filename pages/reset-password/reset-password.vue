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
							<text class="field__code-btn">{{ t('resetPassword.getCode') }}</text>
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
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import BrandLogo from '@/components/BrandLogo.vue'
import { icons } from '@/utils/icons'
import LanguagePopupHost from '@/components/LanguagePopupHost.vue'

const { t } = useLocale()
const email = ref('')
const code = ref('')
const password = ref('')
const showPassword = ref(false)

const handleReset = () => uni.redirectTo({ url: '/pages/login/login' })
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
