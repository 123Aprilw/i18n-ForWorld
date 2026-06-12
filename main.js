import App from './App'

// 全局语言包（统一放最上面）
import en from '@/locale/en.json'
import jp from '@/locale/jp.json'
const messages = {
	jp,
	en
}

// #ifndef VUE3
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import './uni.promisify.adaptor'
Vue.use(VueI18n)
Vue.config.productionTip = false

const i18n = new VueI18n({
	locale: uni.getStorageSync('lang') || 'jp',
	fallbackLocale: 'en',
	messages
})
import uvUI from '@/uni_modules/uv-ui-tools'
Vue.use(uvUI)
App.mpType = 'app'
const app = new Vue({
	i18n,
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
import {
	createI18n
} from 'vue-i18n'

const i18n = createI18n({
	legacy: false,
	locale: uni.getStorageSync('lang') || 'jp',
	fallbackLocale: 'en',
	messages
})
import uvUI from '@/uni_modules/uv-ui-tools'
export function createApp() {
	const app = createSSRApp(App)
	app.use(i18n)
	app.use(uvUI)
	return {
		app,
		i18n
	}
}
// #endif