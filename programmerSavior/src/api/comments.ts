import { readApiResponse } from './http'

/**
 * 评论接口。
 */

export type Comment = {
  id: number
  postId: number
  parentId: number | null
  content: string
  authorName: string
  admin: boolean
  createdAt: string
}

export type CommentListData = {
  viewerName: string
  viewerAdmin: boolean
  comments: Comment[]
}

/**
 * 获取某篇文章的全部评论（扁平结构，前端负责组装成树）。
 */
export async function listComments(postId: number): Promise<CommentListData> {
  let response: Response

  try {
    response = await fetch(`/api/posts/${postId}/comments`, {
      credentials: 'include',
    })
  } catch {
    throw new Error('无法连接服务器')
  }

  return readApiResponse<CommentListData>(response)
}

/**
 * 发表评论或回复。
 *
 * parentId 为空表示顶级评论；
 * 管理员身份由后端从 Session 识别，前端不需要传昵称。
 */
export async function createComment(
  postId: number,
  content: string,
  parentId: number | null,
): Promise<Comment> {
  let response: Response

  try {
    response = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, parentId }),
    })
  } catch {
    throw new Error('无法连接服务器')
  }

  return readApiResponse<Comment>(response)
}
