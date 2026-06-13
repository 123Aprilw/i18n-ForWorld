import { ref } from 'vue'
import type { 
	ApiResponse,
	CreateStripePaymentParams,
	CreateStripePaymentResponse,
	PaymentStatusResponse
} from '../utils/types'
import api from '../utils/api'

/** 支付管理 */
export function usePayment() {
	const loading = ref(false)
	const paymentStatus = ref<PaymentStatusResponse | null>(null)

	// 创建 Stripe 支付
	const createStripePayment = async (reservationOrderId: string, payType: string) => {
		loading.value = true
		try {
			const response = await api.PostPaymentStripeCreate(reservationOrderId, payType) as ApiResponse<CreateStripePaymentResponse>
			return response.data
		} catch (error) {
			console.error('创建支付失败:', error)
			throw error
		} finally {
			loading.value = false
		}
	}

	// 轮询支付状态
	const pollPaymentStatus = async (paymentNo: string, interval: number = 2000, maxAttempts: number = 30) => {
		let attempts = 0
		
		return new Promise<PaymentStatusResponse>((resolve, reject) => {
			const poll = async () => {
				try {
					attempts++
					const response = await api.GetPaymentStatus(paymentNo) as ApiResponse<PaymentStatusResponse>
					paymentStatus.value = response.data
					
					// 如果支付成功或失败，停止轮询
					if (response.data.payment_status === 1 || response.data.payment_status === 2) {
						resolve(response.data)
						return
					}
					
					// 如果达到最大尝试次数，停止轮询
					if (attempts >= maxAttempts) {
						reject(new Error('支付状态查询超时'))
						return
					}
					
					// 继续轮询
					setTimeout(poll, interval)
				} catch (error) {
					console.error('查询支付状态失败:', error)
					reject(error)
				}
			}
			
			poll()
		})
	}

	// 单次查询支付状态
	const getPaymentStatus = async (paymentNo: string) => {
		try {
			const response = await api.GetPaymentStatus(paymentNo) as ApiResponse<PaymentStatusResponse>
			paymentStatus.value = response.data
			return response.data
		} catch (error) {
			console.error('查询支付状态失败:', error)
			throw error
		}
	}

	return {
		loading,
		paymentStatus,
		createStripePayment,
		pollPaymentStatus,
		getPaymentStatus
	}
}
