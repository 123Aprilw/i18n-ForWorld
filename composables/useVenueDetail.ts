import { ref } from 'vue'
import type { Venue, ApiResponse } from '../utils/types'
import api from '../utils/api'

/** 场馆详情 */
export function useVenueDetail() {
	const venue = ref<Venue | null>(null)
	const loading = ref(false)

	// 获取场馆详情
	const fetchVenueDetail = async (id: string) => {
		loading.value = true
		try {
			const response = await api.GetVenueDetail(id) as ApiResponse<Venue>
			venue.value = response.data
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
