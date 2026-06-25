// ==================== 通用类型 ====================
export interface ApiResponse<T = any> {
	code: number
	msg: string
	time: string
	data: T
}

export interface PaginationParams {
	page: number
	limit: number
}

export interface PaginationResponse<T> {
	list: T[]
	has_more: boolean
}

// ==================== 用户认证 ====================
export interface RegisterParams {
	email: string
	password: string
	captcha: string
	agreement: string
}

export interface LoginParams {
	account: string
	password: string
}

export interface EmailLoginParams {
	email: string
	captcha: string
}

export interface ResetPwdParams {
	email: string
	newpassword: string
	captcha: string
}

export interface UserInfo {
	id: number
	email: string
	nickname: string
	avatar: string
	bio: string
	language: number
	token: string
}

// ==================== 用户资料 ====================
export interface UserProfile {
	id: number
	nickname: string
	email: string
	avatar: string
	bio: string
	language: number
}

export interface UpdateProfileParams {
	nickname: string
	avatar: string
	bio: string
}

// ==================== 协议 ====================
export interface Agreement {
	id: number
	type: number // 1=用户协议,2=隐私政策
	title: string
	title_en: string
	content: string
	content_en: string
	version: string
	status: number // 0=隐藏,1=正常
	createtime: number | null
	updatetime: number | null
}

export interface AgreementDetail {
	title: string
	content: string
	version: string
}

// ==================== 场馆 ====================
export interface Venue {
	id: number
	name: string
	name_en: string
	subtitle: string
	subtitle_en: string
	description: string
	description_en: string
	cover_image: string
	images: string | string[]
	address: string
	address_en: string
	zipcode: string
	phone: string
	open_time: string
	close_time: string
	total_seats: number
	advance_days: number
	price_per_minute: number
	min_bill_minutes: number
	checkin_grace_minutes: number
	house_rules: string
	house_rules_en: string
	weigh: number
	status: number
	facilities: VenueFacility[]
	features: VenueFeature[]
}

export interface VenueFacility {
	id: number
	name: string
	name_en: string
	icon: string
	weigh: number
	status: number
}

export interface VenueFeature {
	id: number
	venue_id: number
	title: string
	title_en: string
	description: string
	description_en: string
	image: string
	weigh: number
	status: number
}

export interface VenueListParams extends PaginationParams {}

export interface VenueListResponse extends PaginationResponse<Venue> {}

export interface VenueDetailParams {
	id: string
}

// ==================== 预约订单 ====================
export interface CreateReservationParams {
	venue_id: string
	reserve_date: string
	start_time: string
	end_time: string
}

export interface CreateReservationErrorResponse {
	reserve_date: string
	requested: {
		start_time: string
		end_time: string
	}
	available_ranges: {
		start_time: string
		end_time: string
	}[]
	has_available: boolean
}

export interface ReservationOrderListParams extends PaginationParams {
	status: string // 1已预约/2已到场/3待支付/4已完成/5已取消
}

export interface ReservationOrder {
	id: number
	order_code: string
	user_id: number
	venue_id: number
	reserve_date: string
	start_time: string
	end_time: string
	checkin_time: number | null
	checkout_time: number | null
	checkin_deadline: number | null
	actual_minutes: number
	amount: number
	amount_detail: string | null
	status: number // 1=已预约,2=已到场,3=待支付,4=已完成,5=已取消
	pay_status: number // 0=无,1=待支付,2=已支付
	pay_type: number // 0=无,1=信用卡,2=paypay,3=现金
	cancel_type: number // 0=无,1=手动取消,2=超时未入场
	cancel_reason: string
	cancel_time: number | null
	paid_time: number | null
	qr_token: string
	qr_token_out: string
	createtime: number | null
	updatetime: number | null
}

export interface ReservationOrderDetailParams {
	id: string
}

export interface CancelReservationParams {
	id: string
}

export interface CheckUnpaidResponse {
	has_unpaid: boolean
	order?: {
		id: number | string
		order_code?: string
		amount?: number
		venue_name?: string
	}
}

// ==================== 支付 ====================
export interface Payment {
	id: number
	payment_no: string
	reservation_order_id: number
	user_id: number
	amount: number
	pay_type: number // 1=信用卡,2=paypay,3=现金
	stripe_payment_intent_id: string
	third_party_trade_no: string
	status: number // 0=待处理,1=成功,2=失败
	paid_time: number | null
	createtime: number | null
	updatetime: number | null
}

export interface CreateStripePaymentParams {
	reservation_order_id: string
	pay_type: string // 1信用卡 2PayPay
}

export interface CreateStripePaymentResponse {
	payment_no: string
	payment_url: string
	session_id: string
	amount: number
}

export interface PaymentStatusParams {
	payment_no: string
}

export interface PaymentStatusResponse {
	payment_status: number
	order_status: number
	pay_status: number
}

// ==================== 消息通知 ====================
export interface NotificationListParams {
	type: string // 1系统/2订单/3预约提醒
	last_id: string
	limit: number
}

export interface Notification {
	id: number
	user_id: number
	type: number // 1=系统消息,2=订单消息,3=预约提醒
	title: string
	title_en: string
	content: string
	content_en: string
	related_type: string
	related_id: number
	is_read: number // 0=未读,1=已读
	status: number
	createtime: number
}

export interface NotificationUnreadCountResponse {
	count: number
}

export interface MarkNotificationReadParams {
	id: string
	read_all: string // 1 全部已读
}

// ==================== 公共 ====================
export interface PlatformServiceResponse {
	// 根据实际API响应定义
}

export interface UploadResponse {
	url: string
	fullurl: string
}

// ==================== 邮箱验证码 ====================
export interface SendEmsCodeParams {
	email: string
	event: string // register|resetpwd|emaillogin
}
