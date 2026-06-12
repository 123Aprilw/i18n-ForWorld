import { ref } from 'vue'

const visible = ref(false)

export function useContactPopup() {
	const openContactPopup = () => {
		visible.value = true
	}

	const closeContactPopup = () => {
		visible.value = false
	}

	return {
		visible,
		openContactPopup,
		closeContactPopup
	}
}
