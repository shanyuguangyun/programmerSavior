import { readApiResponse } from './http'

/**
 * HTML 内容接口。
 */

export type Post = {
  id: number
  title: string
  sectionId: string
  sectionLabel: string
  menuId: string
  menuLabel: string
  childId: string | null
  childLabel: string | null
  routePath: string
  imageUrl: string
  plainText: string
  htmlContent: string
  originalFilename: string
  createdAt: string
}

/**
 * 查询某个菜单路由下的 HTML 内容。
 */
export async function listPosts(path: string): Promise<Post[]> {
  let response: Response

  try {
    response = await fetch(`/api/posts?path=${encodeURIComponent(path)}`)
  } catch {
    throw new Error('无法连接服务器')
  }

  return readApiResponse<Post[]>(response)
}

/**
 * 查询单篇内容详情，供独立阅读页使用。
 */
export async function getPost(id: number): Promise<Post> {
  let response: Response

  try {
    response = await fetch(`/api/posts/${id}`)
  } catch {
    throw new Error('无法连接服务器')
  }

  return readApiResponse<Post>(response)
}

/**
 * 上传 HTML 文件。
 *
 * 目录信息、文件名等由 FormData 一起提交；
 * 标题、首图和纯文本由后端解析，前端不重复处理。
 */
export async function uploadPost(formData: FormData): Promise<Post> {
  let response: Response

  try {
    response = await fetch('/api/posts', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
  } catch {
    throw new Error('无法连接服务器，请确认后端已启动')
  }

  return readApiResponse<Post>(response)
}
