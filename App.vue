<script>
export default {
	onLaunch() {
		if (!uni.getStorageSync('lang')) {
			uni.setStorageSync('lang', 'jp')
		}
	}
}
</script>

<style lang="scss">
@import '@/uni_modules/uv-ui-tools/index.scss';

page {
	font-family: 'Noto Sans JP', Inter, -apple-system, BlinkMacSystemFont, sans-serif;
	background-color: #ffffff;
	color: #0B1C30;
	box-sizing: border-box;
}

view, text, input, button {
	box-sizing: border-box;
}
</style>
