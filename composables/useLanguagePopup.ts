import { ref } from 'vue'

const visible = ref(false)

export function useLanguagePopup() {
	const openLanguagePopup = () => {
		visible.value = true
	}

	const closeLanguagePopup = () => {
		visible.value = false
	}

	return {
		visible,
		openLanguagePopup,
		closeLanguagePopup
	}
}
