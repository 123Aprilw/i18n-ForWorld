import { ref } from 'vue'
import type { 
	UserInfo, 
	ApiResponse,
	RegisterParams,
	LoginParams,
	EmailLoginParams,
	ResetPwdParams
} from '../utils/types'
import api from '../utils/api'

/** 用户认证管理 */
export function useAuth() {
	const userInfo = ref<UserInfo | null>(null)
	const loading = ref(false)
	const isLoggedIn = ref(false)

	// 注册
	const register = async (params: RegisterParams) => {
		loading.value = true
		try {
			const response = await api.PostRegister(params.email, params.password, params.captcha, params.agreement) as ApiResponse<{ userinfo: UserInfo }>
			
			// 保存用户信息和token
			if (response.data.userinfo.token) {
				uni.setStorageSync('token', response.data.userinfo.token)
			}
			userInfo.value = response.data.userinfo
			isLoggedIn.value = true
			
			return response
		} catch (error) {
			console.error('注册失败:', error)
			throw error
		} finally {
			loading.value = false
		}
	}

	// 密码登录
	const login = async (params: LoginParams) => {
		loading.value = true
		try {
			const response = await api.PostPwdLogin(params.account, params.password) as ApiResponse<{ userinfo: UserInfo }>
			
			// 保存用户信息和token
			if (response.data.userinfo.token) {
				uni.setStorageSync('token', response.data.userinfo.token)
			}
			userInfo.value = response.data.userinfo
			isLoggedIn.value = true
			
			return response
		} catch (error) {
			console.error('登录失败:', error)
			throw error
		} finally {
			loading.value = false
		}
	}

	// 邮箱验证码登录
	const emailLogin = async (params: EmailLoginParams) => {
		loading.value = true
		try {
			const response = await api.PostEmailLogin(params.email, params.captcha) as ApiResponse<{ userinfo: UserInfo }>
			
			// 保存用户信息和token
			if (response.data.userinfo.token) {
				uni.setStorageSync('token', response.data.userinfo.token)
			}
			userInfo.value = response.data.userinfo
			isLoggedIn.value = true
			
			return response
		} catch (error) {
			console.error('邮箱登录失败:', error)
			throw error
		} finally {
			loading.value = false
		}
	}

	// 重置密码
	const resetPassword = async (params: ResetPwdParams) => {
		loading.value = true
		try {
			const response = await api.PostResetPwd(params.email, params.newpassword, params.captcha) as ApiResponse<any>
			return response
		} catch (error) {
			console.error('重置密码失败:', error)
			throw error
		} finally {
			loading.value = false
		}
	}

	// 退出登录
	const logout = async () => {
		loading.value = true
		try {
			await api.PostLogout()
		} catch (error) {
			console.error('退出登录失败:', error)
		} finally {
			// 清除本地存储
			uni.removeStorageSync('token')
			userInfo.value = null
			isLoggedIn.value = false
			loading.value = false
		}
	}

	// 检查登录状态
	const checkLoginStatus = () => {
		const token = uni.getStorageSync('token')
		isLoggedIn.value = !!token
		return isLoggedIn.value
	}

	// 发送验证码
	const sendVerificationCode = async (email: string, event: string) => {
		try {
			const response = await api.PostEmsCode(email, event) as ApiResponse<any>
			return response
		} catch (error) {
			console.error('发送验证码失败:', error)
			throw error
		}
	}

	return {
		userInfo,
		loading,
		isLoggedIn,
		register,
		login,
		emailLogin,
		resetPassword,
		logout,
		checkLoginStatus,
		sendVerificationCode
	}
}
