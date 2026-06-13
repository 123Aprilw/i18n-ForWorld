const env = {
	mode: import.meta.env.MODE as 'development' | 'production' | 'test',
	baseUrl: import.meta.env.VITE_BASE_URL || '',
	isDev: import.meta.env.MODE === 'development',
	isProd: import.meta.env.MODE === 'production',
	isTest: import.meta.env.MODE === 'test'
}

// 获取完整的图片URL
export const getImageUrl = (path: string): string => {
	if (!path) return ''
	// 如果已经是完整URL，直接返回
	if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/static/')) {
		return path
	}
	// 否则加上baseUrl前缀
	return `${env.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`
}

export default env