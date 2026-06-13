import { ref } from 'vue'
import type { 
	Notification, 
	ApiResponse,
	NotificationUnreadCountResponse
} from '../utils/types'
import api from '../utils/api'

/** 消息通知管理 */
export function useNotification() {
	const notifications = ref<Notification[]>([])
	const loading = ref(false)
	const unreadCount = ref(0)
	const hasMore = ref(false)
	const currentPage = ref(1)
	const pageSize = ref(10)

	// 获取消息列表
	const fetchNotifications = async (type: string, lastId: string = '0', reset: boolean = false) => {
		loading.value = true
		try {
			const response = await api.GetNotificationList(type, lastId, pageSize.value) as ApiResponse<{ list: Notification[], has_more: boolean }>
			
			if (reset) {
				notifications.value = response.data.list
			} else {
				notifications.value = [...notifications.value, ...response.data.list]
			}
			
			hasMore.value = response.data.has_more
		} catch (error) {
			console.error('获取消息列表失败:', error)
		} finally {
			loading.value = false
		}
	}

	// 获取未读数量
	const fetchUnreadCount = async () => {
		try {
			const response = await api.GetNotificationUnreadCount() as ApiResponse<NotificationUnreadCountResponse>
			unreadCount.value = response.data.count
			return response.data.count
		} catch (error) {
			console.error('获取未读数量失败:', error)
			throw error
		}
	}

	// 标记已读
	const markAsRead = async (id: string, readAll: string = '0') => {
		try {
			const response = await api.PostNotificationRead(id, readAll) as ApiResponse<any>
			
			// 如果标记全部已读，清空未读数量
			if (readAll === '1') {
				unreadCount.value = 0
				notifications.value = notifications.value.map(n => ({ ...n, is_read: 1 }))
			} else {
				// 标记单条已读
				const notification = notifications.value.find(n => n.id === parseInt(id))
				if (notification && notification.is_read === 0) {
					notification.is_read = 1
					unreadCount.value = Math.max(0, unreadCount.value - 1)
				}
			}
			
			return response
		} catch (error) {
			console.error('标记已读失败:', error)
			throw error
		}
	}

	// 加载更多
	const loadMore = (type: string) => {
		if (!loading.value && hasMore.value && notifications.value.length > 0) {
			const lastId = notifications.value[notifications.value.length - 1].id.toString()
			fetchNotifications(type, lastId, false)
		}
	}

	// 刷新
	const refresh = (type: string) => {
		fetchNotifications(type, '0', true)
	}

	return {
		notifications,
		loading,
		unreadCount,
		hasMore,
		fetchNotifications,
		fetchUnreadCount,
		markAsRead,
		loadMore,
		refresh
	}
}
