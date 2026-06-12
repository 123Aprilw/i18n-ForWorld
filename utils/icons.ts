/** 自定义图标路径，配合 uv-icon name 传入（含 / 时自动按图片渲染） */
export const icons = {
	world: '/static/images/world.png',
	language: {
		japanese: '/static/images/jpan.png',
		english: '/static/images/english.png'
	},
	shopping: '/static/images/shopping.png',
	locationPin: '/static/images/venues/location-pin.png',
	clock: '/static/images/times.png',
	gavel: '/static/images/chuizi.png',
	yuyue: '/static/images/yuyue.png',
	time: '/static/images/time.png',
	payment: '/static/images/payment.png',
	xinyongka: '/static/images/xinyongka.png',
	paypay: '/static/images/paypay.png',
	eyeOpen: '/static/images/open.png',
	eyeClose: '/static/images/close.png',
	logo: '/static/logo.png',
	appIcon: '/static/login.png',
	agreement: {
		terms: '/static/images/agreement/icon-terms.png',
		user: '/static/images/agreement/icon-user.png',
		privacy: '/static/images/agreement/icon-privacy.svg',
		warning: '/static/images/agreement/icon-warning.png'
	},
	profile: {
		avatar: '/static/images/profile/avatar.png',
		camera: '/static/images/profile/camera.svg',
		edit: '/static/images/profile/icon-user.png',
		history: '/static/images/profile/menu-history.png',
		notification: '/static/images/profile/menu-notification.svg',
		contact: '/static/images/profile/menu-contact.png',
		arrow: '/static/images/profile/arrow-right.svg'
	},
	facility: {
		wifi: '/static/images/facilities/wifi.png',
		coffee: '/static/images/facilities/coffee.png',
		group: '/static/images/facilities/group.png',
		palette: '/static/images/facilities/palette.png',
		silence: '/static/images/facilities/silence.png',
		wood: '/static/images/facilities/wood.png',
		executive: '/static/images/facilities/executive.png',
		meeting: '/static/images/facilities/meeting.png'
	},
	seat: {
		precaution1: '/static/images/facilities/silence.png',
		precaution2: '/static/images/smoking.png',
		precaution3: '/static/images/animals.png',
		precaution4: '/static/images/food.png',
		precaution5: '/static/images/clean.png',
		precaution6: '/static/images/time.png',
		precaution7: '/static/images/fire.png',
		precaution8: '/static/images/locks.png'
	}
} as const