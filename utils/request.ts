import env from '@/src/config/env.ts'
const config = {
	baseUrl: env.baseUrl, // 你的接口地址
	timeout: 10000, // 超时时间
	loading: true, // 是否默认开启loading
}

/**
 * 请求拦截器
 */
const requestInterceptors = (options : UniApp.RequestOptions) => {
	// 1. 添加token
	const token = uni.getStorageSync('token')
	if (token) {
		options.header = {
			...options.header,
			Authorization: 'Bearer ' + token,
		}
	}

	// 2. 自动拼接基础URL
	options.url = config.baseUrl + options.url

	// 3. 超时时间
	options.timeout = config.timeout

	// 4. 开启loading
	if (config.loading) {
		uni.showLoading({
			title: '加载中...',
			mask: true,
		})
	}

	return options
}

/**
 * 响应拦截器
 */
const responseInterceptors = (res : any) => {
	uni.hideLoading() // 关闭loading

	// 状态码正常
	if (res.statusCode === 200) {
		const data = res.data

		// 后端自定义成功code
		if (data.code === 1) {
			return data
		}

		// 登录过期
		if (data.code === 401) {
			uni.removeStorageSync('token')
			uni.showToast({ title: '登录已过期', icon: 'none' })
			setTimeout(() => {
				uni.navigateTo({ url: '/pages/login/login' })
			}, 1000)
			return Promise.reject(data)
		}

		// 其他错误
		uni.showToast({
			title: data.msg || '请求失败',
			icon: 'none',
		})
		return Promise.reject(data)
	}

	// 网络错误
	uni.showToast({
		title: '网络异常',
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

	return new Promise((resolve, reject) => {
		uni.request({
			...options,
			success: (res) => {
				const result = responseInterceptors(res)
				resolve(result)
			},
			fail: (err) => {
				uni.hideLoading()
				uni.showToast({ title: '请求失败', icon: 'none' })
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