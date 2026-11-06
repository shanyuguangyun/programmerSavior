/**
 * 后端统一响应结构。
 */
export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T | null
}

/**
 * 解析后端 ApiResponse。
 * 非 2xx 或 success=false 时抛出可直接展示给用户的错误。
 */
export async function readApiResponse<T>(response: Response): Promise<T> {
  let payload: ApiResponse<T> | null = null

  try {
    payload = (await response.json()) as ApiResponse<T>
  } catch {
    // 后端不可达或返回了非 JSON 内容时，走通用错误提示。
  }

  if (!response.ok || !payload?.success || payload.data === null) {
    throw new Error(payload?.message || '请求失败，请稍后重试')
  }

  return payload.data
}
