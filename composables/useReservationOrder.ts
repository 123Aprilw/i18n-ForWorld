import { ref } from 'vue'
import type { 
	ReservationOrder, 
	ApiResponse, 
	CreateReservationParams,
	ReservationOrderListParams,
	CheckUnpaidResponse
} from '../utils/types'
import api from '../utils/api'

/** 预约订单管理 */
export function useReservationOrder() {
	const orders = ref<ReservationOrder[]>([])
	const loading = ref(false)
	const hasMore = ref(false)
	const currentPage = ref(1)
	const pageSize = ref(10)
	const hasUnpaid = ref(false)

	// 获取订单列表
	const fetchOrders = async (status: string, page: number = 1, reset: boolean = false) => {
		loading.value = true
		try {
			const response = await api.GetReservationOrderList(status, page, pageSize.value) as ApiResponse<{ list: ReservationOrder[], has_more: boolean }>
			
			if (reset) {
				orders.value = response.data.list
			} else {
				orders.value = [...orders.value, ...response.data.list]
			}
			
			hasMore.value = response.data.has_more
			currentPage.value = page
		} catch (error) {
			console.error('获取订单列表失败:', error)
		} finally {
			loading.value = false
		}
	}

	// 创建预约
	const createReservation = async (params: CreateReservationParams) => {
		try {
			const response = await api.PostReservationOrderCreate(
				params.venue_id,
				params.reserve_date,
				params.start_time,
				params.end_time
			) as ApiResponse<any>
			return response
		} catch (error) {
			console.error('创建预约失败:', error)
			throw error
		}
	}

	// 获取订单详情
	const getOrderDetail = async (id: string) => {
		try {
			const response = await api.GetReservationOrderDetail(id) as ApiResponse<ReservationOrder>
			return response.data
		} catch (error) {
			console.error('获取订单详情失败:', error)
			throw error
		}
	}

	// 取消预约
	const cancelReservation = async (id: string) => {
		try {
			const response = await api.PostReservationOrderCancel(id) as ApiResponse<any>
			return response
		} catch (error) {
			console.error('取消预约失败:', error)
			throw error
		}
	}

	// 检查待支付订单
	const checkUnpaid = async () => {
		try {
			const response = await api.GetReservationOrderCheckUnpaid() as ApiResponse<CheckUnpaidResponse>
			hasUnpaid.value = response.data.has_unpaid
			return response.data
		} catch (error) {
			console.error('检查待支付订单失败:', error)
			throw error
		}
	}

	// 加载更多
	const loadMore = (status: string) => {
		if (!loading.value && hasMore.value) {
			fetchOrders(status, currentPage.value + 1, false)
		}
	}

	// 刷新
	const refresh = (status: string) => {
		fetchOrders(status, 1, true)
	}

	return {
		orders,
		loading,
		hasMore,
		hasUnpaid,
		fetchOrders,
		createReservation,
		getOrderDetail,
		cancelReservation,
		checkUnpaid,
		loadMore,
		refresh
	}
}
