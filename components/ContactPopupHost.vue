<template>
	<uv-popup
		ref="popupRef"
		mode="bottom"
		round="24"
		:z-index="10075"
		:overlay-opacity="0.6"
		:close-on-click-overlay="true"
		@change="onPopupChange"
	>
		<view class="contact-popup">
			<view class="contact-popup__phone" @click="callPhone">
				<text>{{ t('profile.contactPhone') }}</text>
			</view>
			<view class="contact-popup__divider" />
			<view class="contact-popup__cancel" @click="closePopup">
				<text>{{ t('common.cancel') }}</text>
			</view>
		</view>
	</uv-popup>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { useContactPopup } from '@/composables/useContactPopup'

const { t } = useLocale()
const { visible, closeContactPopup } = useContactPopup()
const popupRef = ref<{ open: () => void; close: () => void } | null>(null)

watch(visible, (show) => {
	if (show) {
		nextTick(() => popupRef.value?.open())
	} else {
		popupRef.value?.close()
	}
})

const onPopupChange = (e: { show: boolean }) => {
	if (!e.show) closeContactPopup()
}

const closePopup = () => {
	closeContactPopup()
}

const callPhone = () => {
	const phone = t('profile.contactPhone').replace(/-/g, '')
	uni.makePhoneCall({
		phoneNumber: phone,
		fail: () => {
			uni.setClipboardData({
				data: t('profile.contactPhone'),
				success: () => {
					uni.showToast({ title: t('profile.phoneCopied'), icon: 'none' })
				}
			})
		}
	})
}
</script>

<style lang="scss" scoped>
.contact-popup {
	background: #FFFFFF;
	border-radius: 24rpx 24rpx 0 0;
	padding-bottom: env(safe-area-inset-bottom);
	box-shadow: 0 -8rpx 40rpx rgba(0, 0, 0, 0.08);
}

.contact-popup__phone {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx 32rpx 32rpx;

	text {
		font-size: 32rpx;
		font-weight: 400;
		color: #333333;
		line-height: 1.5;
		text-align: center;
	}
}

.contact-popup__divider {
	height: 1rpx;
	background: #DDDDDD;
	margin: 0;
}

.contact-popup__cancel {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 32rpx 32rpx 40rpx;

	text {
		font-size: 32rpx;
		font-weight: 400;
		color: #0058BE;
		line-height: 1.5;
		text-align: center;
	}
}
</style>
