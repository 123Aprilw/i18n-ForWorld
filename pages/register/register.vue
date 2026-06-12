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
							<text class="field__code-btn">{{ t('register.getCode') }}</text>
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
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import BrandLogo from '@/components/BrandLogo.vue'
import { icons } from '@/utils/icons'
import LanguagePopupHost from '@/components/LanguagePopupHost.vue'

const { t } = useLocale()
const email = ref('')
const code = ref('')
const password = ref('')
const agreed = ref(false)
const showPassword = ref(false)

const handleRegister = () => {
	if (!agreed.value) return
	uni.redirectTo({ url: '/pages/login/login' })
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
</style>
