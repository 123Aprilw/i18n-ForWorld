import { ref } from 'vue'
import type { Venue, ApiResponse } from '../utils/types'
import api from '../utils/api'

/** 场馆详情 */
export function useVenueDetail() {
	const venue = ref<Venue | null>(null)
	const loading = ref(false)

	// 获取场馆详情
	// keepExisting: true 时保留旧数据（下拉刷新场景），避免骨架屏闪现
	const fetchVenueDetail = async (id: string, keepExisting = false) => {
		loading.value = true
		if (!keepExisting) {
			venue.value = null  // 首次加载才清空，避免刷新时旧数据消失
		}
		try {
			const response = await api.GetVenueDetail(id) as ApiResponse<Venue>
			console.log('API响应完整数据:', response)
			console.log('API响应data字段:', response.data)
			venue.value = response.data
			console.log('赋值后的venue.value:', venue.value)
			return response.data
		} catch (error) {
			console.error('获取场馆详情失败:', error)
			throw error
		} finally {
			loading.value = false
		}
	}

	// 清空详情
	const clearVenue = () => {
		venue.value = null
	}

	return {
		venue,
		loading,
		fetchVenueDetail,
		clearVenue
	}
}
