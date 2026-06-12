import { ref } from 'vue'
import type { Venue } from '@/utils/mock'
import { venues as mockVenues } from '@/utils/mock'

/** 场馆列表；当前用 mock，接入接口后替换 fetchVenues 内请求即可 */
export function useVenueList() {
	const venues = ref<Venue[]>([])
	const loading = ref(false)

	const fetchVenues = async () => {
		loading.value = true
		try {
			// TODO: 接入接口
			// const { data } = await uni.request({ url: '/api/venues' })
			// venues.value = data as Venue[]
			venues.value = mockVenues
		} finally {
			loading.value = false
		}
	}

	return { venues, loading, fetchVenues }
}
