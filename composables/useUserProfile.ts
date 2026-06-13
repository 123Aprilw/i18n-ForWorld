import { ref } from 'vue'
import type { UserProfile, ApiResponse, UpdateProfileParams } from '../utils/types'
import api from '../utils/api'

/** 用户资料管理 */
export function useUserProfile() {
	const userProfile = ref<UserProfile | null>(null)
	const loading = ref(false)

	// 获取用户资料
	const fetchUserProfile = async () => {
		loading.value = true
		try {
			const response = await api.GetUserProfile() as ApiResponse<UserProfile>
			userProfile.value = response.data
			return response.data
		} catch (error) {
			console.error('获取用户资料失败:', error)
			throw error
		} finally {
			loading.value = false
		}
	}

	// 更新用户资料
	const updateUserProfile = async (params: UpdateProfileParams) => {
		loading.value = true
		try {
			const response = await api.PostUserProfile(params.nickname, params.avatar, params.bio) as ApiResponse<any>
			
			// 更新本地资料
			if (userProfile.value) {
				userProfile.value = {
					...userProfile.value,
					nickname: params.nickname,
					avatar: params.avatar,
					bio: params.bio
				}
			}
			
			return response
		} catch (error) {
			console.error('更新用户资料失败:', error)
			throw error
		} finally {
			loading.value = false
		}
	}

	// 清空用户资料
	const clearUserProfile = () => {
		userProfile.value = null
	}

	return {
		userProfile,
		loading,
		fetchUserProfile,
		updateUserProfile,
		clearUserProfile
	}
}
