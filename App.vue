<script>
	export default {
		onLaunch() {
			if (!uni.getStorageSync('lang')) {
				uni.setStorageSync('lang', 'jp')
			}

			// ===== iOS 兼容性 Debug =====
			const sysInfo = uni.getSystemInfoSync()
			console.log('[DEBUG][App] 系统信息:', JSON.stringify({
				platform: sysInfo.platform,
				system: sysInfo.system,
				brand: sysInfo.brand,
				model: sysInfo.model,
				SDKVersion: sysInfo.SDKVersion,
				uniPlatform: sysInfo.uniPlatform,
				browserName: sysInfo.browserName,
				browserVersion: sysInfo.browserVersion,
			}))
			const token = uni.getStorageSync('token')
			const lang = uni.getStorageSync('lang')
			console.log('[DEBUG][App] token:', token ? '有token(长度:' + token.length + ')' : '无token')
			console.log('[DEBUG][App] lang:', lang)
			// 检测是否 iOS
			if (sysInfo.platform === 'ios') {
				console.warn('[DEBUG][App] ⚠️ 当前运行在 iOS 设备上，注意兼容性')
			}
		}
	}
</script>

<style lang="scss">
	@import '@/uni_modules/uv-ui-tools/index.scss';

	page {
		font-family: 'Noto Sans JP', Inter, -apple-system, BlinkMacSystemFont, sans-serif;
		background-color: #DAE6F3;
		color: #0B1C30;
		box-sizing: border-box;
	}

	view,
	text,
	input,
	button {
		box-sizing: border-box;
	}

	// 全局覆盖 white-space: pre 样式
	view, text {
		white-space: normal !important;
		word-wrap: break-word !important;
		overflow-wrap: break-word !important;
	}

	/* ── 页面切换过渡动画 ── */
	/* 进入：从右滑入 */
	.uni-page-wrapper {
		animation: pageSlideIn 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
	}

	@keyframes pageSlideIn {
		from {
			opacity: 0;
			transform: translateX(32px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	/* 返回：淡入 */
	.uni-page-wrapper--back {
		animation: pageFadeIn 0.22s ease both;
	}

	@keyframes pageFadeIn {
		from { opacity: 0; }
		to   { opacity: 1; }
	}
</style>