<template>
	<view
		class="pull-refresh"
		@touchstart="onTouchStart"
		@touchmove="onTouchMove"
		@touchend="onTouchEnd"
	>
		<!-- 下拉刷新指示器 -->
		<view
			class="pull-refresh__indicator"
			:style="indicatorStyle"
		>
			<view class="pull-refresh__status">
				<view v-if="refreshStatus === 'pulling'" class="pull-refresh__state-row">
					<view class="pull-refresh__icon pull-refresh__icon--arrow" :style="arrowStyle">↓</view>
					<text class="pull-refresh__text">{{ t('common.pullRefresh') }}</text>
				</view>
				<view v-else-if="refreshStatus === 'loading'" class="pull-refresh__state-row">
					<view class="pull-refresh__spinner" />
					<text class="pull-refresh__text">{{ t('common.refreshing') }}</text>
				</view>
				<view v-else-if="refreshStatus === 'success'" class="pull-refresh__state-row">
					<view class="pull-refresh__icon pull-refresh__icon--success">✓</view>
					<text class="pull-refresh__text">{{ t('common.refreshSuccess') }}</text>
				</view>
			</view>
		</view>

		<!-- 内容区，随手指下移 -->
		<view class="pull-refresh__content" :style="contentStyle">
			<scroll-view
				scroll-y
				class="pull-refresh__scroll"
				:show-scrollbar="false"
				:lower-threshold="100"
				:scroll-top="scrollTop"
				@scroll="onScroll"
				@scrolltolower="onScrollToLower"
			>
				<slot></slot>

				<!-- 加载更多 -->
				<view v-if="hasMore || isLoadingMore" class="pull-refresh__load-more">
					<view v-if="isLoadingMore" class="pull-refresh__load-more-spinner" />
					<text v-if="isLoadingMore">{{ t('common.loading') }}</text>
					<text v-else-if="hasMore">{{ t('common.loadMore') }}</text>
				</view>
				<view v-else-if="showNoMore" class="pull-refresh__load-more">
					<text>{{ t('common.noMore') }}</text>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLocale } from '@/composables/useLocale'

interface Props {
	refresh?: () => Promise<void>
	loadMore?: () => Promise<void>
	hasMore?: boolean
	isLoadingMore?: boolean
	showNoMore?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	hasMore: false,
	isLoadingMore: false,
	showNoMore: false
})

const emit = defineEmits<{ scrollToLower: [] }>()
const { t } = useLocale()

// ─── 状态 ───────────────────────────────────────────────
type RefreshStatus = 'idle' | 'pulling' | 'loading' | 'success'

const refreshStatus = ref<RefreshStatus>('idle')
const pullDistance = ref(0)       // 当前下拉距离 px
const scrollTop = ref(0)          // scroll-view 内部滚动位置
const currentScrollTop = ref(0)   // 实时 scrollTop（用于判断是否在顶部）
const loadMoreLock = ref(false)

// 触摸起点
let touchStartY = 0
let isTouching = false

// 阈值：超过此距离松手才触发刷新
const THRESHOLD = 70   // px
const MAX_PULL  = 100  // px，最大拉伸距离（含阻尼）

// ─── 计算样式 ────────────────────────────────────────────
const indicatorStyle = computed(() => {
	const h = Math.min(pullDistance.value, MAX_PULL)
	return {
		height: `${h}px`,
		overflow: 'hidden',
		transition: isTouching ? 'none' : 'height 0.3s ease'
	}
})

const contentStyle = computed(() => {
	const dy = Math.min(pullDistance.value, MAX_PULL)
	return {
		transform: `translateY(${dy}px)`,
		transition: isTouching ? 'none' : 'transform 0.3s ease'
	}
})

const arrowStyle = computed(() => {
	const ratio = Math.min(pullDistance.value / THRESHOLD, 1)
	return { transform: `rotate(${ratio * 180}deg)`, transition: 'transform 0.2s' }
})

// ─── Touch 事件 ──────────────────────────────────────────
const onTouchStart = (e: TouchEvent) => {
	// 只有真正在顶部才响应下拉
	if (currentScrollTop.value > 2) return
	if (refreshStatus.value === 'loading') return
	touchStartY = e.touches[0].clientY
	isTouching = true
}

const onTouchMove = (e: TouchEvent) => {
	if (!isTouching) return
	if (currentScrollTop.value > 2) {
		// 滚动过程中位置超过顶部，取消手势
		isTouching = false
		pullDistance.value = 0
		return
	}

	const deltaY = e.touches[0].clientY - touchStartY
	if (deltaY <= 0) {
		// 向上滑，不处理
		pullDistance.value = 0
		return
	}

	// 阻尼：下拉越多，增量越小
	pullDistance.value = Math.min(deltaY * 0.5, MAX_PULL)

	if (pullDistance.value > 5) {
		refreshStatus.value = 'pulling'
	}
}

const onTouchEnd = async () => {
	if (!isTouching) return
	isTouching = false

	if (pullDistance.value >= THRESHOLD && refreshStatus.value === 'pulling') {
		// 触发刷新：内容停在阈值位置
		pullDistance.value = THRESHOLD
		refreshStatus.value = 'loading'
		try {
			if (props.refresh) await props.refresh()
			refreshStatus.value = 'success'
			setTimeout(() => {
				pullDistance.value = 0
				refreshStatus.value = 'idle'
			}, 800)
		} catch {
			pullDistance.value = 0
			refreshStatus.value = 'idle'
		}
	} else {
		// 未达阈值，回弹
		pullDistance.value = 0
		if (refreshStatus.value === 'pulling') refreshStatus.value = 'idle'
	}
}

// ─── scroll-view 滚动监听 ────────────────────────────────
const onScroll = (e: any) => {
	currentScrollTop.value = e?.detail?.scrollTop ?? 0
}

// ─── 上拉加载更多 ────────────────────────────────────────
const triggerLoadMore = async () => {
	if (loadMoreLock.value || !props.hasMore || props.isLoadingMore || !props.loadMore) return
	loadMoreLock.value = true
	try {
		await props.loadMore()
	} catch (err) {
		console.error('Load more failed:', err)
	} finally {
		loadMoreLock.value = false
	}
	emit('scrollToLower')
}

const onScrollToLower = () => {
	triggerLoadMore()
}

// H5 window scroll 兜底（scroll-view 高度不固定时）
const handleWindowScroll = () => {
	const st = window.scrollY || document.documentElement.scrollTop
	const wh = window.innerHeight
	const dh = document.documentElement.scrollHeight
	if (dh - st - wh < 150) triggerLoadMore()
}

onMounted(() => {
	window.addEventListener('scroll', handleWindowScroll, { passive: true })
})
onUnmounted(() => {
	window.removeEventListener('scroll', handleWindowScroll)
})

defineExpose({
	refresh: async () => {
		refreshStatus.value = 'loading'
		pullDistance.value = THRESHOLD
		try {
			if (props.refresh) await props.refresh()
			refreshStatus.value = 'success'
			setTimeout(() => {
				pullDistance.value = 0
				refreshStatus.value = 'idle'
			}, 800)
		} catch {
			pullDistance.value = 0
			refreshStatus.value = 'idle'
		}
	}
})
</script>

<style lang="scss" scoped>
.pull-refresh {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
	// iOS Safari: 确保容器高度能正确传递给子元素
	display: flex;
	flex-direction: column;
}

.pull-refresh__indicator {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	z-index: 10;
	display: flex;
	align-items: flex-end;
	justify-content: center;
	padding-bottom: 10px;
	pointer-events: none;
}

.pull-refresh__content {
	width: 100%;
	// 用 flex: 1 + min-height: 0 代替 height: 100%，iOS Safari 更可靠
	flex: 1;
	min-height: 0;
	will-change: transform;
}

.pull-refresh__scroll {
	width: 100%;
	height: 100%;
}

.pull-refresh__status {
	display: inline-flex;
	align-items: center;
	padding: 10rpx 32rpx;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 9999rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.12);
}

.pull-refresh__state-row {
	display: flex;
	align-items: center;
	// gap 在 iOS 13 及以下不支持，用 margin 代替
	& > * + * {
		margin-left: 12rpx;
	}
}

.pull-refresh__icon {
	font-size: 28rpx;
	color: #0058BE;
	font-weight: bold;
	display: flex;
	align-items: center;
	justify-content: center;

	&--arrow {
		display: inline-block;
	}

	&--success {
		color: #10B981;
	}
}

.pull-refresh__spinner {
	width: 32rpx;
	height: 32rpx;
	border: 4rpx solid #E2E8F0;
	border-top-color: #0058BE;
	border-radius: 50%;
	animation: pr-spin 0.8s linear infinite;
	flex-shrink: 0;
}

@keyframes pr-spin {
	to { transform: rotate(360deg); }
}

.pull-refresh__text {
	font-size: 28rpx;
	color: #0058BE;
	font-weight: 500;
	line-height: 1.4;
}

.pull-refresh__load-more {
	padding: 32rpx;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;

	text {
		font-size: 28rpx;
		color: #727785;
		line-height: 1.4;
	}
}

.pull-refresh__load-more-spinner {
	width: 32rpx;
	height: 32rpx;
	border: 4rpx solid #E2E8F0;
	border-top-color: #0058BE;
	border-radius: 50%;
	animation: pr-spin 0.8s linear infinite;
	flex-shrink: 0;
}
</style>
