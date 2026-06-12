<template>
	<view class="block-page" />
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'

onLoad((query) => {
	const venue = query?.venueId ? `venueId=${query.venueId}` : ''
	const space = query?.space ? `&space=${query.space}` : ''
	uni.redirectTo({ url: `/pages/seat/date?${venue}${space}` })
})
</script>

<style lang="scss" scoped>
.block-page {
	min-height: 100vh;
	background: #F8F9FF;
}
</style>
