import { get, post } from '@/utils/request.ts'

// ==================== 邮箱验证码 ====================
const PostEmsCode = (Email: string, Event: string) => {
	return post('/api/ems/send', {
		email: Email,
		event: Event
	})
}

// ==================== 用户认证 ====================
// 注册
const PostRegister = (Email: string, Password: string, Captcha: string, Agreement: string) => {
	return post('/api/v1/user/register', {
		email: Email,
		password: Password,
		captcha: Captcha,
		agreement: Agreement
	})
}

// 密码登录
const PostPwdLogin = (Account: string, Password: string) => {
	return post('/api/v1/user/login', {
		account: Account,
		password: Password
	})
}

// 邮箱验证码登录
const PostEmailLogin = (Email: string, Captcha: string) => {
	return post('/api/v1/user/emaillogin', {
		email: Email,
		captcha: Captcha
	})
}

// 重置密码
const PostResetPwd = (Email: string, NewPassword: string, Captcha: string) => {
	return post('/api/v1/user/resetpwd', {
		email: Email,
		newpassword: NewPassword,
		captcha: Captcha
	})
}

// 退出登录
const PostLogout = () => {
	return post('/api/v1/user/logout')
}

// ==================== 用户资料 ====================
// 获取个人资料
const GetUserProfile = () => {
	return get('/api/v1/user/profile')
}

// 更新个人资料
const PostUserProfile = (Nickname: string, Avatar: string, Bio: string) => {
	return post('/api/v1/user/profile', {
		nickname: Nickname,
		avatar: Avatar,
		bio: Bio
	})
}

// ==================== 协议 ====================
// 获取协议详情
const GetAgreementDetail = (Type: string) => {
	return get('/api/v1/agreement/detail', {
		type: Type
	})
}

// ==================== 场馆 ====================
// 场馆列表
const GetVenueList = (Page: number, Limit: number) => {
	return get('/api/v1/venue/index', {
		page: Page,
		limit: Limit
	})
}

// 场馆详情
const GetVenueDetail = (Id: string) => {
	return get('/api/v1/venue/detail', {
		id: Id
	})
}

// ==================== 预约订单 ====================
// 创建预约
const PostReservationOrderCreate = (VenueId: string, ReserveDate: string, StartTime: string, EndTime: string) => {
	return post('/api/v1/reservation_order/create', {
		venue_id: VenueId,
		reserve_date: ReserveDate,
		start_time: StartTime,
		end_time: EndTime
	})
}

// 订单列表
const GetReservationOrderList = (Status: string, Page: number, Limit: number) => {
	return get('/api/v1/reservation_order/list', {
		status: Status,
		page: Page,
		limit: Limit
	})
}

// 订单详情
const GetReservationOrderDetail = (Id: string) => {
	return get('/api/v1/reservation_order/detail', {
		id: Id
	})
}

// 取消预约
const PostReservationOrderCancel = (Id: string) => {
	return post('/api/v1/reservation_order/cancel', {
		id: Id
	})
}

// 检查待支付订单
const GetReservationOrderCheckUnpaid = () => {
	return get('/api/v1/reservation_order/check_unpaid')
}

// ==================== 支付 ====================
// 创建 Stripe 支付
const PostPaymentStripeCreate = (ReservationOrderId: string, PayType: string) => {
	return post('/api/v1/payment/stripe_create', {
		reservation_order_id: ReservationOrderId,
		pay_type: PayType
	})
}

// Stripe Webhook
const PostPaymentStripeWebhook = (Data: any) => {
	return post('/api/v1/payment/stripe_webhook', Data)
}

// 支付状态轮询
const GetPaymentStatus = (PaymentNo: string) => {
	return get('/api/v1/payment/status', {
		payment_no: PaymentNo
	})
}

// ==================== 消息通知 ====================
// 消息列表
const GetNotificationList = (Type: string, LastId: string, Limit: number) => {
	return get('/api/v1/notification/index', {
		type: Type,
		last_id: LastId,
		limit: Limit
	})
}

// 未读数量
const GetNotificationUnreadCount = () => {
	return get('/api/v1/notification/unread_count')
}

// 标记已读
const PostNotificationRead = (Id: string, ReadAll: string) => {
	return post('/api/v1/notification/read', {
		id: Id,
		read_all: ReadAll
	})
}

// ==================== 公共 ====================
// 获取客服
const GetPlatformService = () => {
	return get('/api/v1/common/platform_service')
}

// 上传文件
const PostUpload = (File: any) => {
	return post('/api/v1/common/upload', {
		file: File
	})
}

export default {
	// 邮箱验证码
	PostEmsCode,

	// 用户认证
	PostRegister,
	PostPwdLogin,
	PostEmailLogin,
	PostResetPwd,
	PostLogout,

	// 用户资料
	GetUserProfile,
	PostUserProfile,

	// 协议
	GetAgreementDetail,

	// 场馆
	GetVenueList,
	GetVenueDetail,

	// 预约订单
	PostReservationOrderCreate,
	GetReservationOrderList,
	GetReservationOrderDetail,
	PostReservationOrderCancel,
	GetReservationOrderCheckUnpaid,

	// 支付
	PostPaymentStripeCreate,
	PostPaymentStripeWebhook,
	GetPaymentStatus,

	// 消息通知
	GetNotificationList,
	GetNotificationUnreadCount,
	PostNotificationRead,

	// 公共
	GetPlatformService,
	PostUpload
}