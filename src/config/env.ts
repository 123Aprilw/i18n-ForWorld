const env = {
	mode: import.meta.env.MODE as 'development' | 'production' | 'test',
	baseUrl: import.meta.env.VITE_BASE_URL || '',
	isDev: import.meta.env.MODE === 'development',
	isProd: import.meta.env.MODE === 'production',
	isTest: import.meta.env.MODE === 'test'
}

export default env