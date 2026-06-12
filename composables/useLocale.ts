import { useI18n } from 'vue-i18n'

export function useLocale() {
	const { locale, t } = useI18n()

	const setLocale = (lang: 'jp' | 'en') => {
		locale.value = lang
		uni.setStorageSync('lang', lang)
	}

	const toggleLocale = () => {
		setLocale(locale.value === 'jp' ? 'en' : 'jp')
	}

	const langLabel = () => (locale.value === 'jp' ? 'JP / EN' : 'EN / JP')

	return { locale, t, setLocale, toggleLocale, langLabel }
}
