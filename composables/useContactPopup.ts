import { ref } from 'vue'
import api from '@/utils/api'

const visible = ref(false)
const platformService = ref<any>(null)
const loading = ref(false)

export function useContactPopup() {
	const fetchPlatformService = async () => {
		if (platformService.value) return platformService.value
		
		loading.value = true
		try {
			const response = await api.GetPlatformService() as any
			platformService.value = response.data
			return response.data
		} catch (error) {
			console.error('获取客服信息失败:', error)
			return null
		} finally {
			loading.value = false
		}
	}

	const openContactPopup = async () => {
		visible.value = true
		fetchPlatformService() // 异步加载，不阻塞弹窗打开
	}

	const closeContactPopup = () => {
		visible.value = false
	}

	return {
		visible,
		platformService,
		loading,
		fetchPlatformService,
		openContactPopup,
		closeContactPopup
	}
}
