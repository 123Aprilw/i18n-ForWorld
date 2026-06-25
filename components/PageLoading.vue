<template>
	<view v-if="visible" class="page-loading">
		<view class="page-loading__inner">

			<!-- ── home / venue：大图卡片骨架 ── -->
			<template v-if="type === 'home'">
				<view class="skeleton skeleton--logo" />
				<view v-for="i in 3" :key="i" class="skeleton-card">
					<view class="skeleton skeleton--image" />
					<view class="skeleton-card__body">
						<view class="skeleton skeleton--title" />
						<view class="skeleton skeleton--line" />
						<view class="skeleton skeleton--line skeleton--line--short" />
					</view>
				</view>
			</template>

			<!-- ── list：订单/消息列表骨架 ── -->
			<template v-else-if="type === 'list'">
				<!-- header bar -->
				<view class="skeleton skeleton--logo" />
				<!-- tab pills -->
				<view class="sk-tabs">
					<view v-for="i in 4" :key="i" class="skeleton skeleton--tab" />
				</view>
				<!-- list rows -->
				<view v-for="i in 4" :key="i" class="skeleton-row-card">
					<view class="skeleton-row-card__left">
						<view class="skeleton skeleton--avatar" />
						<view class="skeleton-row-card__lines">
							<view class="skeleton skeleton--row-title" />
							<view class="skeleton skeleton--row-sub" />
						</view>
					</view>
					<view class="skeleton skeleton--badge" />
				</view>
			</template>

			<!-- ── profile：头像 + 菜单骨架 ── -->
			<template v-else-if="type === 'profile'">
				<view class="skeleton skeleton--logo" />
				<!-- 用户卡 -->
				<view class="skeleton-profile-card">
					<view class="skeleton skeleton--avatar-lg" />
					<view class="skeleton-profile-card__info">
						<view class="skeleton skeleton--name" />
						<view class="skeleton skeleton--email" />
					</view>
				</view>
				<!-- 菜单列表 -->
				<view class="skeleton-menu">
					<view v-for="i in 4" :key="i" class="skeleton-menu-item">
						<view class="skeleton skeleton--menu-icon" />
						<view class="skeleton skeleton--menu-label" />
						<view class="skeleton skeleton--menu-arrow" />
					</view>
				</view>
			</template>

			<!-- ── venue：场馆详情骨架 ── -->
			<template v-else-if="type === 'venue'">
				<!-- 图片轮播区 -->
				<view class="skeleton skeleton--venue-gallery" />
				<!-- 标题块 -->
				<view class="skeleton-card-plain">
					<view class="skeleton skeleton--title" />
					<view class="skeleton skeleton--line" style="width:70%" />
				</view>
				<!-- 描述段落 -->
				<view class="skeleton-card-plain">
					<view class="skeleton skeleton--section-heading" />
					<view class="skeleton skeleton--line" />
					<view class="skeleton skeleton--line" />
					<view class="skeleton skeleton--line skeleton--line--short" />
				</view>
				<!-- 设施网格 -->
				<view class="sk-amenity-grid">
					<view v-for="i in 4" :key="i" class="skeleton skeleton--amenity" />
				</view>
				<!-- 空间特色卡片 -->
				<view v-for="i in 2" :key="i" class="skeleton-card">
					<view class="skeleton skeleton--bento-img" />
					<view class="skeleton-card__body">
						<view class="skeleton skeleton--title" />
						<view class="skeleton skeleton--line skeleton--line--short" />
					</view>
				</view>
			</template>
			<template v-else-if="type === 'detail'">
				<!-- 场馆图 -->
				<view class="skeleton-card">
					<view class="skeleton skeleton--detail-image" />
					<view class="skeleton-card__body">
						<view class="skeleton skeleton--title" />
						<view class="skeleton skeleton--line skeleton--line--short" />
					</view>
				</view>
				<!-- 信息卡 x2 -->
				<view v-for="i in 2" :key="i" class="skeleton-info-card">
					<view class="skeleton skeleton--info-title" />
					<view class="skeleton skeleton--line" />
					<view class="skeleton skeleton--line skeleton--line--short" />
				</view>
			</template>

		</view>

		<!-- 底部转圈 + 文字 -->
		<view class="page-loading__footer">
			<view class="page-loading__spinner" />
			<text class="page-loading__text">{{ lang === 'jp' ? '読み込み中...' : 'Loading...' }}</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

withDefaults(defineProps<{
	visible?: boolean
	/** 骨架类型：home | list | profile | detail | venue */
	type?: 'home' | 'list' | 'profile' | 'detail' | 'venue'
}>(), {
	type: 'home'
})

const lang = computed(() => uni.getStorageSync('lang') || 'jp')
</script>

<style lang="scss" scoped>
.page-loading {
	position: fixed;
	top: 0;
	bottom: 0;
	left: var(--app-left, 0);
	right: var(--app-right, 0);
	z-index: 9999;
	background: #DAE6F3;
	display: flex;
	flex-direction: column;
	padding: calc(env(safe-area-inset-top) + 128rpx) 32rpx 32rpx;
	box-sizing: border-box;
	gap: 32rpx;
}

.page-loading__inner {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 24rpx;
	overflow: hidden;
}

/* ════════════════════════════
   骨架基础 + shimmer
════════════════════════════ */
.skeleton {
	background: linear-gradient(
		90deg,
		rgba(194, 198, 214, 0.5) 25%,
		rgba(255, 255, 255, 0.8) 50%,
		rgba(194, 198, 214, 0.5) 75%
	);
	background-size: 200% 100%;
	border-radius: 16rpx;
	animation: shimmer 1.4s ease-in-out infinite;

	/* ── home / venue ── */
	&--logo       { width: 240rpx; height: 56rpx; border-radius: 12rpx; margin-bottom: 8rpx; }
	&--image      { width: 100%; height: 360rpx; border-radius: 24rpx 24rpx 0 0; }
	&--title      { width: 60%; height: 36rpx; margin-bottom: 16rpx; }
	&--line       { width: 80%; height: 26rpx; margin-bottom: 12rpx;
		&--short  { width: 50%; }
	}

	/* ── list ── */
	&--tab        { width: 120rpx; height: 60rpx; border-radius: 9999rpx; flex-shrink: 0; }
	&--avatar     { width: 80rpx; height: 80rpx; border-radius: 16rpx; flex-shrink: 0; }
	&--row-title  { width: 240rpx; height: 32rpx; margin-bottom: 12rpx; }
	&--row-sub    { width: 160rpx; height: 24rpx; }
	&--badge      { width: 120rpx; height: 44rpx; border-radius: 9999rpx; flex-shrink: 0; }

	/* ── profile ── */
	&--avatar-lg  { width: 100rpx; height: 100rpx; border-radius: 50%; flex-shrink: 0; }
	&--name       { width: 200rpx; height: 36rpx; margin-bottom: 12rpx; }
	&--email      { width: 280rpx; height: 26rpx; }
	&--menu-icon  { width: 64rpx; height: 64rpx; border-radius: 50%; flex-shrink: 0; }
	&--menu-label { flex: 1; height: 32rpx; }
	&--menu-arrow { width: 20rpx; height: 32rpx; border-radius: 4rpx; flex-shrink: 0; }

	/* ── venue ── */
	&--venue-gallery  { width: 100%; height: 330rpx; border-radius: 24rpx; }
	&--section-heading { width: 50%; height: 40rpx; margin-bottom: 20rpx; }
	&--amenity        { height: 88rpx; border-radius: 16rpx; }
	&--bento-img      { width: 100%; height: 220rpx; border-radius: 24rpx 24rpx 0 0; }

	/* ── detail ── */
	&--detail-image { width: 100%; height: 280rpx; border-radius: 24rpx 24rpx 0 0; }
	&--info-title   { width: 40%; height: 32rpx; margin-bottom: 20rpx; }
}

/* ════════════════════════════
   骨架容器
════════════════════════════ */
/* 大图卡片 */
.skeleton-card {
	background: #fff;
	border-radius: 24rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.04);
}
.skeleton-card__body { padding: 24rpx 32rpx 32rpx; }

/* tab 胶囊行 */
.sk-tabs {
	display: flex;
	gap: 16rpx;
	overflow: hidden;
}

/* 列表行卡片 */
.skeleton-row-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 24rpx;
	background: #fff;
	border-radius: 24rpx;
	padding: 32rpx;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.04);
}
.skeleton-row-card__left {
	display: flex;
	align-items: center;
	gap: 24rpx;
	flex: 1;
	min-width: 0;
}
.skeleton-row-card__lines { flex: 1; }

/* 个人资料卡 */
.skeleton-profile-card {
	display: flex;
	align-items: center;
	gap: 24rpx;
	background: #fff;
	border-radius: 32rpx;
	padding: 32rpx 44rpx;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.04);
}
.skeleton-profile-card__info { flex: 1; }

/* 菜单列表 */
.skeleton-menu {
	background: #fff;
	border-radius: 32rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.04);
}
.skeleton-menu-item {
	display: flex;
	align-items: center;
	gap: 32rpx;
	padding: 40rpx 48rpx;
	& + & { border-top: 1rpx solid rgba(229, 238, 255, 0.4); }
}

/* 详情信息卡 */
.skeleton-info-card {
	background: #fff;
	border-radius: 24rpx;
	padding: 32rpx;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.04);
}

/* 设施网格 2列 */
.sk-amenity-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20rpx;
}

/* 纯文字块（无卡片背景） */
.skeleton-card-plain {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

/* ════════════════════════════
   底部转圈动画
════════════════════════════ */
.page-loading__footer {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20rpx;
	padding-bottom: calc(env(safe-area-inset-bottom) + 32rpx);
}

.page-loading__spinner {
	width: 56rpx;
	height: 56rpx;
	border: 6rpx solid rgba(0, 88, 190, 0.15);
	border-top-color: #0058BE;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

.page-loading__text {
	font-size: 24rpx;
	color: #727785;
	line-height: 1.4;
}

@keyframes shimmer {
	0%   { background-position: 200% 0; }
	100% { background-position: -200% 0; }
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to   { transform: rotate(360deg); }
}
</style>
