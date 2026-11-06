import { readApiResponse } from './http'

/**
 * 登录相关接口。
 *
 * 所有请求都走相对路径 /api，开发环境由 Vite 代理到后端 8080 端口。
 */

export type LoginResult = {
  username: string
}

/**
 * 账号密码登录。
 *
 * credentials: 'include' 让浏览器在同一个源下带上 JSESSIONID；
 * 密码只发送给后端，不在前端保存。
 */
export async function login(
  username: string,
  password: string,
): Promise<LoginResult> {
  let response: Response

  try {
    response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    })
  } catch {
    throw new Error('无法连接服务器，请确认后端已启动')
  }

  return readApiResponse<LoginResult>(response)
}

/**
 * 查询当前登录账号。
 * 未登录或后端未启动时返回 null，页面按未登录状态展示。
 */
export async function getCurrentUser(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
    })

    if (response.status === 401) {
      return null
    }

    const data = await readApiResponse<LoginResult>(response)
    return data.username
  } catch {
    return null
  }
}

/**
 * 退出登录，销毁服务端 Session。
 */
export async function logout(): Promise<void> {
  let response: Response

  try {
    response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    throw new Error('无法连接服务器')
  }

  if (!response.ok) {
    throw new Error('退出登录失败，请稍后重试')
  }
}
