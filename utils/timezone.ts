/**
 * 东京时区工具函数（Asia/Tokyo, UTC+9）
 *
 * 原理：
 *   Date 对象内部存的是 UTC 毫秒数，getHours() 等方法用"本地时区偏移"来呈现。
 *   要让它呈现出东京时间，只需把 UTC 毫秒数加上东京偏移(+9h)再减去本地偏移，
 *   这样 JS 引擎用本地偏移还原时，结果刚好等于东京时间。
 *
 *   公式：tokyoDisplayMs = utcMs + 9h - localOffsetMs
 *         其中 localOffsetMs = -getTimezoneOffset() * 60 * 1000
 *         （getTimezoneOffset 在 UTC+8 返回 -480，所以要取负）
 *
 *   最终：tokyoDisplayMs = utcMs + 9*3600*1000 + getTimezoneOffset()*60*1000
 */

const TOKYO_HOURS = 9
const TOKYO_OFFSET_MS = TOKYO_HOURS * 60 * 60 * 1000 // 9h in ms

/**
 * 获取东京当前时间。
 * 返回的 Date 对象调用 getFullYear/getMonth/getDate/getHours/getMinutes
 * 得到的就是东京本地时间，可直接用于日历和时间选择器逻辑。
 */
export function nowTokyo(): Date {
  const utcMs = Date.now()
  // getTimezoneOffset() 在 UTC+8 设备上返回 -480 (分钟)
  const localOffsetMs = new Date().getTimezoneOffset() * 60 * 1000 // 负数表示东部时区
  // tokyoDisplayMs 使得 new Date(tokyoDisplayMs).getHours() === 东京小时
  const tokyoDisplayMs = utcMs + TOKYO_OFFSET_MS + localOffsetMs
  return new Date(tokyoDisplayMs)
}

/**
 * 将 Unix 秒级时间戳格式化为东京时区的 "YYYY-MM-DD HH:mm" 字符串。
 */
export function formatTimestampTokyo(ts: number | null): string {
  if (!ts) return ''
  const utcMs = ts * 1000
  const localOffsetMs = new Date().getTimezoneOffset() * 60 * 1000
  const tokyoDisplayMs = utcMs + TOKYO_OFFSET_MS + localOffsetMs
  const d = new Date(tokyoDisplayMs)
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${mo}-${day} ${h}:${m}`
}
