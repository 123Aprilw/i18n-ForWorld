import env from '@/src/config/env.ts'
import { useLoading } from '@/composables/useLoading'

const { showLoading, hideLoading } = useLoading()

const config = {
	baseUrl: env.baseUrl,
	timeout: 10000,
	loading: true,
}

// 防止 401 弹窗重复弹出
let sessionExpiredShowing = false

/**
 * 处理 token 过期：弹出模态框，点确认跳登录页
 */
const handleSessionExpired = () => {
	if (sessionExpiredShowing) return
	sessionExpiredShowing = true

	const lang = uni.getStorageSync('lang') || 'jp'
	const isJp = lang === 'jp'

	// 清除 token —— 清除后后续请求不再携带 token，也不会再触发 401
	uni.removeStorageSync('token')

	uni.showModal({
		title: isJp ? 'ログインの有効期限切れ' : 'Session Expired',
		content: isJp
			? 'ログインの有効期限が切れました。再度ログインしてください。'
			: 'Your login session has expired. Please log in again.',
		showCancel: true,
		cancelText: isJp ? 'キャンセル' : 'Cancel',
		confirmText: isJp ? 'ログインへ' : 'Log In',
		confirmColor: '#0058BE',
		success: (res) => {
			// 弹窗关闭后不重置 sessionExpiredShowing
			// token 已清除，本次 app 生命周期内不再重复弹出
			if (res.confirm) {
				uni.reLaunch({ url: '/pages/login/login' })
			}
		},
		fail: () => {
			// 同上，不重置
		}
	})
}

/**
 * 请求拦截器
 */
const requestInterceptors = (options : UniApp.RequestOptions) => {
	const token = uni.getStorageSync('token')
	const lang = uni.getStorageSync('lang') || 'jp'
	const acceptLanguage = lang === 'jp' ? 'ja' : 'en'

	// 一次性合并所有请求头
	options.header = {
		...options.header,
		'Accept-Language': acceptLanguage,
		...(token ? { token } : {})
	}

	options.url = config.baseUrl + options.url
	options.timeout = config.timeout

	if (config.loading) {
		showLoading(lang === 'jp' ? '読み込み中...' : 'Loading...')
	}

	return options
}

/**
 * 响应拦截器
 */
const responseInterceptors = (res : any) => {
	hideLoading()

	// 状态码正常
	if (res.statusCode === 200) {
		const data = res.data

		// 后端自定义成功code
		if (data.code === 1) {
			return data
		}

		// 登录过期 / 未授权
		if (data.code === 401) {
			handleSessionExpired()
			return Promise.reject(data)
		}

		// 业务错误：抛出，由调用方的 catch 处理并展示 msg
		return Promise.reject(data)
	}

	// HTTP 401（部分服务器直接返回 HTTP 状态码）
	if (res.statusCode === 401) {
		handleSessionExpired()
		return Promise.reject(res)
	}

	// 网络错误
	const lang = uni.getStorageSync('lang') || 'jp'
	uni.showToast({
		title: lang === 'jp' ? 'ネットワーク異常' : 'Network error',
		icon: 'none',
	})
	return Promise.reject(res)
}

/**
 * 核心请求方法
 * @param options
 */
const request = <T = any>(options : UniApp.RequestOptions) : Promise<T> => {
	// 执行请求拦截
	options = requestInterceptors(options)

	// iOS debug：打印请求信息
	const isIOS = uni.getSystemInfoSync().platform === 'ios'
	if (isIOS) {
		console.log(`[DEBUG][Request][iOS] ${options.method} ${options.url}`, '| data:', JSON.stringify(options.data), '| headers:', JSON.stringify(options.header))
	}

	return new Promise((resolve, reject) => {
		uni.request({
			...options,
			success: (res) => {
				if (isIOS) {
					console.log(`[DEBUG][Request][iOS] 响应 ${options.url} | statusCode:`, res.statusCode, '| data:', JSON.stringify(res.data))
				}
				Promise.resolve(responseInterceptors(res))
					.then(resolve)
					.catch((err) => {
						if (isIOS) {
							console.error(`[DEBUG][Request][iOS] 响应拦截器reject ${options.url}`, JSON.stringify(err))
						}
						reject(err)
					})
			},
			fail: (err) => {
				hideLoading()
				if (isIOS) {
					console.error(`[DEBUG][Request][iOS] 请求失败 ${options.url}`, JSON.stringify(err))
				}
				const lang = uni.getStorageSync('lang') || 'jp'
				uni.showToast({
					title: lang === 'jp' ? 'リクエスト失敗' : 'Request failed',
					icon: 'none'
				})
				reject(err)
			},
		})
	})
}

/**
 * 快捷方法 GET
 */
export const get = <T = any>(
	url : string,
	data ?: any,
	header ?: any
) : Promise<T> => {
	return request<T>({
		url,
		data,
		header,
		method: 'GET',
	})
}

/**
 * 快捷方法 POST
 */
export const post = <T = any>(
	url : string,
	data ?: any,
	header ?: any
) : Promise<T> => {
	return request<T>({
		url,
		data,
		header,
		method: 'POST',
	})
}
export default request