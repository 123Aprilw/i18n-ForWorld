/// <reference types="vite/client" />
/// <reference types="@dcloudio/types" />

// 识别 .vue 文件
declare module '*.vue' {
	import type { DefineComponent } from 'vue'
	const component : DefineComponent<{}, {}, any>
	export default component
}

// 环境变量类型
interface ImportMetaEnv {
	readonly MODE : 'development' | 'production' | 'test';
	readonly VITE_BASE_URL : string
}

interface ImportMeta {
	readonly env : ImportMetaEnv
}