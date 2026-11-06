import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  createComment,
  listComments,
  type Comment,
  type CommentListData,
} from '../api/comments'

type CommentNode = Comment & {
  children: CommentNode[]
}

/**
 * 把后端返回的扁平评论组装成嵌套树。
 * parentId 找不到对应父节点时，按顶级评论处理。
 */
function buildTree(comments: Comment[]): CommentNode[] {
  const nodes = new Map<number, CommentNode>()

  comments.forEach((comment) => {
    nodes.set(comment.id, { ...comment, children: [] })
  })

  const roots: CommentNode[] = []
  comments.forEach((comment) => {
    const node = nodes.get(comment.id)
    if (!node) return

    const parent = comment.parentId === null
      ? undefined
      : nodes.get(comment.parentId)

    if (parent) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

function formatCommentDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

type CommentItemProps = {
  node: CommentNode
  depth: number
  onReply: (parentId: number, content: string) => Promise<void>
}

/**
 * 单条评论。回复继续递归渲染，所以层级不设上限。
 * 直接子回复超过 5 条时默认只显示前 5 条。
 */
function CommentItem({ node, depth, onReply }: CommentItemProps) {
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [replyError, setReplyError] = useState('')
  const [replying, setReplying] = useState(false)
  const [showAllReplies, setShowAllReplies] = useState(false)

  const visibleChildren = showAllReplies
    ? node.children
    : node.children.slice(0, 5)

  async function handleReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = replyContent.trim()
    if (!content) {
      setReplyError('请输入回复内容')
      return
    }

    setReplyError('')
    setReplying(true)
    try {
      await onReply(node.id, content)
      setReplyContent('')
      setReplyOpen(false)
    } catch (error) {
      setReplyError(
        error instanceof Error ? error.message : '回复失败，请稍后重试',
      )
    } finally {
      setReplying(false)
    }
  }

  return (
    <div data-comment-id={node.id}>
      <div className="flex gap-3">
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
            node.admin
              ? 'bg-violet-600 text-white'
              : 'bg-zinc-100 text-zinc-500'
          }`}
          aria-hidden="true"
        >
          {node.admin ? '管' : node.authorName.charAt(0)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[13px] font-bold text-zinc-800">
              {node.authorName}
            </span>
            {node.admin ? (
              <span className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">
                管理员
              </span>
            ) : null}
            <span className="text-[11px] text-zinc-400">
              {formatCommentDate(node.createdAt)}
            </span>
          </div>

          <p className="mt-1.5 whitespace-pre-wrap break-words text-[13px] leading-6 text-zinc-600">
            {node.content}
          </p>

          <button
            type="button"
            onClick={() => {
              setReplyOpen((current) => !current)
              setReplyError('')
            }}
            className="mt-1.5 text-[12px] font-semibold text-zinc-400 transition-colors hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200"
          >
            {replyOpen ? '取消回复' : '回复'}
          </button>

          {replyOpen ? (
            <form
              className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3"
              onSubmit={handleReply}
            >
              <textarea
                value={replyContent}
                onChange={(event) => setReplyContent(event.target.value)}
                rows={3}
                maxLength={1000}
                autoFocus
                placeholder={`回复 ${node.authorName}`}
                className="w-full resize-y rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] leading-6 text-zinc-700 outline-none transition placeholder:text-zinc-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
              />
              {replyError ? (
                <p className="mt-1.5 text-[12px] text-red-500">{replyError}</p>
              ) : null}
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={replying}
                  className="rounded-lg bg-violet-600 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
                >
                  {replying ? '发布中…' : '发布回复'}
                </button>
              </div>
            </form>
          ) : null}

          {node.children.length > 0 ? (
            <div
              className={`mt-4 space-y-4 ${
                depth < 2
                  ? 'border-l border-zinc-200 pl-3 sm:pl-4'
                  : ''
              }`}
            >
              {visibleChildren.map((child) => (
                <CommentItem
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  onReply={onReply}
                />
              ))}

              {node.children.length > 5 ? (
                <button
                  type="button"
                  onClick={() => setShowAllReplies((current) => !current)}
                  className="text-[12px] font-semibold text-violet-600 transition-colors hover:text-violet-800"
                >
                  {showAllReplies
                    ? '收起回复'
                    : `显示更多回复（共 ${node.children.length} 条）`}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

type CommentsSectionProps = {
  postId: number
}

/**
 * 文章底部的评论区。
 *
 * 未登录用户也能发表评论；后端根据 IP 生成匿名昵称。
 * 已登录管理员发表评论时，后端会保存并使用真实账号名。
 */
export function CommentsSection({ postId }: CommentsSectionProps) {
  const [data, setData] = useState<CommentListData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [formError, setFormError] = useState('')

  const roots = useMemo(
    () => (data ? buildTree(data.comments) : []),
    [data],
  )

  useEffect(() => {
    let active = true

    listComments(postId)
      .then((nextData) => {
        if (!active) return
        setData(nextData)
        setError('')
      })
      .catch((loadError: unknown) => {
        if (!active) return
        setError(
          loadError instanceof Error ? loadError.message : '评论加载失败',
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [postId])

  /** 发布或回复后重新拉取全部评论，保证树结构一致。 */
  async function refreshComments() {
    const nextData = await listComments(postId)
    setData(nextData)
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = content.trim()
    if (!value) {
      setFormError('请输入评论内容')
      return
    }

    setFormError('')
    setPosting(true)
    try {
      await createComment(postId, value, null)
      setContent('')
      await refreshComments()
    } catch (postError) {
      setFormError(
        postError instanceof Error ? postError.message : '评论失败，请稍后重试',
      )
    } finally {
      setPosting(false)
    }
  }

  async function handleReply(parentId: number, value: string) {
    await createComment(postId, value, parentId)
    await refreshComments()
  }

  return (
    <section
      id="comments"
      className="mt-10 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-4">
        <h2 className="text-lg font-bold tracking-tight text-zinc-900">
          评论
        </h2>
        <span className="text-[11px] font-semibold text-zinc-400">
          {data ? `${data.comments.length} 条` : ''}
        </span>
      </div>

      {data ? (
        <p className="mt-3 text-[11px] text-zinc-400">
          {data.viewerAdmin
            ? `以管理员 ${data.viewerName} 身份发表评论`
            : `你将使用昵称 ${data.viewerName} 发表评论`}
        </p>
      ) : null}

      <form className="mt-3" onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(event) => {
            setContent(event.target.value)
            setFormError('')
          }}
          rows={4}
          maxLength={1000}
          disabled={posting || loading}
          placeholder="写下你的评论…"
          className="w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50/40 px-3 py-2.5 text-[13px] leading-6 text-zinc-700 outline-none transition placeholder:text-zinc-400 focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100 disabled:bg-zinc-50"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[11px] text-zinc-400">
            {content.length} / 1000
          </span>
          <button
            type="submit"
            disabled={posting || loading}
            className="rounded-lg bg-violet-600 px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
          >
            {posting ? '发布中…' : '发表评论'}
          </button>
        </div>
        {formError ? (
          <p className="mt-2 text-[12px] text-red-500">{formError}</p>
        ) : null}
      </form>

      {loading ? (
        <p className="py-8 text-center text-[13px] text-zinc-400">
          评论加载中…
        </p>
      ) : null}

      {error ? (
        <p className="py-6 text-center text-[13px] text-red-500">{error}</p>
      ) : null}

      {!loading && !error && roots.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-zinc-400">
          还没有评论，来说两句吧。
        </p>
      ) : null}

      {roots.length > 0 ? (
        <div className="mt-6 space-y-6 border-t border-zinc-100 pt-6">
          {roots.map((node) => (
            <CommentItem
              key={node.id}
              node={node}
              depth={0}
              onReply={handleReply}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
