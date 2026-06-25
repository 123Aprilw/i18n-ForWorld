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
			
			console.log('API Response:', response)
			console.log('Response data:', response.data)
			
			const list = Array.isArray(response.data?.list) ? response.data.list : []
			
			console.log('Venue list:', list)
			
			if (reset) {
				venues.value = list
			} else {
				const currentVenues = Array.isArray(venues.value) ? venues.value : []
				venues.value = [...currentVenues, ...list]
			}
			
			hasMore.value = response.data?.has_more || false
			currentPage.value = page
			
			console.log('Final venues:', venues.value)
		} catch (error) {
			console.error('获取场馆列表失败:', error)
		} finally {
			loading.value = false
		}
	}

	const loadMore = () => {
		if (hasMore.value) {
			return fetchVenues(currentPage.value + 1, false)
		}
		return Promise.resolve()
	}

	const refresh = () => {
		fetchVenues(1, true)
	}

	return { venues, loading, hasMore, fetchVenues, loadMore, refresh }
}
