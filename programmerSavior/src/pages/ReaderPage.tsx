import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getPost, type Post } from '../api/posts'
import { CommentsSection } from '../components/CommentsSection'

/**
 * 独立文章阅读页。
 *
 * 这个路由不经过 App 布局，所以会在新标签页里以整页方式展示：
 * 标题 → HTML 内容 → 评论区，不带侧边栏。
 */
export default function ReaderPage() {
  const { postId } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [error, setError] = useState('')
  const parsedPostId = Number(postId)
  const validPostId = Number.isInteger(parsedPostId) && parsedPostId > 0

  useEffect(() => {
    if (!validPostId) {
      return
    }

    let active = true
    getPost(parsedPostId)
      .then((data) => {
        if (!active) return
        setPost(data)
        setError('')
        document.title = `${data.title} | Programmer Savior`
      })
      .catch((loadError: unknown) => {
        if (!active) return
        setError(
          loadError instanceof Error ? loadError.message : '文章加载失败',
        )
      })

    return () => {
      active = false
    }
  }, [parsedPostId, validPostId])

  const displayError = validPostId ? error : '文章地址不正确'
  const category = post
    ? [post.sectionLabel, post.menuLabel, post.childLabel]
        .filter(Boolean)
        .join(' / ')
    : ''

  // 根据纯文本长度粗略估算 iframe 高度：
  // 短文章不会留下一大片空白，长文章仍可在 iframe 内滚动。
  const articleHeight = post
    ? Math.min(860, Math.max(360, 260 + Math.ceil(post.plainText.length / 38) * 26))
    : 460

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 max-w-[1000px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/works"
            className="flex items-center gap-2.5 text-[14px] font-bold tracking-tight text-zinc-900 no-underline"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600 text-[10px] font-bold text-white">
              PS
            </span>
            Programmer Savior
          </Link>
          <Link
            to={post?.routePath ?? '/works'}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            返回目录
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1000px] px-4 py-8 sm:px-6 sm:py-10">
        {displayError ? (
          <div className="rounded-xl border border-zinc-200 bg-white px-6 py-14 text-center">
            <p className="text-sm text-zinc-500">{displayError}</p>
            <Link
              to="/works"
              className="mt-4 inline-flex text-[13px] font-semibold text-violet-700 hover:text-violet-900"
            >
              返回目录
            </Link>
          </div>
        ) : null}

        {!displayError && !post ? (
          <p className="py-24 text-center text-sm text-zinc-400">加载中…</p>
        ) : null}

        {post ? (
          <>
            <p className="text-[11px] font-semibold tracking-wide text-zinc-400">
              {category}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              {post.title}
            </h1>

            {/*
              文章 HTML 单独放进 sandbox iframe：
              保留上传页面自己的样式，同时阻止脚本影响阅读页。
            */}
            <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <iframe
                title={post.title}
                srcDoc={post.htmlContent}
                sandbox=""
                style={{ height: `${articleHeight}px` }}
                className="w-full border-0 bg-white"
              />
            </div>

            <CommentsSection key={post.id} postId={post.id} />
          </>
        ) : null}
      </main>
    </div>
  )
}
