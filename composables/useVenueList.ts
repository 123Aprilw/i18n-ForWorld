import { ref } from 'vue'
import type { Venue, ApiResponse, VenueListResponse } from '@/utils/types'
import api from '@/utils/api'

/** 场馆列表 */
export function useVenueList() {
	const venues = ref<Venue[]>([])
	const loading = ref(false)
	const hasMore = ref(false)
	const currentPage = ref(1)
	const pageSize = ref(10)

	const fetchVenues = async (page: number = 1, reset: boolean = false) => {
		loading.value = true
		try {
			const response = await api.GetVenueList(page, pageSize.value) as ApiResponse<VenueListResponse>
			
			const list = Array.isArray(response.data?.list) ? response.data.list : []
			
			if (reset) {
				venues.value = list
			} else {
				const currentVenues = Array.isArray(venues.value) ? venues.value : []
				venues.value = [...currentVenues, ...list]
			}
			
			hasMore.value = response.data?.has_more || false
			currentPage.value = page
		} catch (error) {
			console.error('获取场馆列表失败:', error)
		} finally {
			loading.value = false
		}
	}

	const loadMore = () => {
		if (!loading.value && hasMore.value) {
			fetchVenues(currentPage.value + 1, false)
		}
	}

	const refresh = () => {
		fetchVenues(1, true)
	}

	return { venues, loading, hasMore, fetchVenues, loadMore, refresh }
}
