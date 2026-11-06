import { useEffect, useState, type ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { listPosts, type Post } from '../api/posts'

/**
 * 路由页面占位组件。
 *
 * 当前路径下如果有上传的 HTML，会显示为紧凑列表；
 * 点击某一项后在新标签页打开独立阅读页和评论区。
 */
type PagePlaceholderProps = {
  title: string
  description?: string
  children?: ReactNode
}

/**
 * 后端时间格式转成短日期。
 */
function formatDate(value: string) {
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

export function PagePlaceholder({
  title,
  description,
  children,
}: PagePlaceholderProps) {
  const location = useLocation()
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState('')

  // 路由变化或上传后重新进入当前路由时，重新拉取该路径下的 HTML。
  useEffect(() => {
    let active = true

    listPosts(location.pathname)
      .then((data) => {
        if (!active) return
        setPosts(data)
        setError('')
      })
      .catch((loadError: unknown) => {
        if (!active) return
        setPosts([])
        setError(
          loadError instanceof Error
            ? loadError.message
            : '内容加载失败',
        )
      })

    return () => {
      active = false
    }
  }, [location.pathname, location.key])

  return (
    <section className="min-w-0">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-[13px] leading-5 text-zinc-500">
          {description}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 text-[13px] leading-5 text-red-500">
          内容加载失败：{error}
        </p>
      ) : null}

      {/* 紧凑列表：比普通列表略高，保留缩略图和标题信息 */}
      {posts.length > 0 ? (
        <div className="mt-6 divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          {posts.map((post) => {
            const category = [
              post.sectionLabel,
              post.menuLabel,
              post.childLabel,
            ]
              .filter(Boolean)
              .join(' / ')

            return (
              <a
                key={post.id}
                href={`/reader/${post.id}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`在新标签页打开 ${post.title}`}
                title="在新标签页打开"
                className="flex items-center gap-3 px-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-300 sm:gap-4 sm:px-4"
              >
                {/* 小缩略图，只作为列表识别信息 */}
                <div className="h-[56px] w-[88px] shrink-0 overflow-hidden rounded-lg bg-violet-50 sm:h-[72px] sm:w-[128px]">
                  <img
                    src={post.imageUrl || '/default-cover.svg'}
                    alt={post.title}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src = '/default-cover.svg'
                    }}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[15px] font-bold tracking-tight text-zinc-900">
                    {post.title}
                  </h2>
                  <p className="mt-1 truncate text-xs text-zinc-400">
                    {category} · {formatDate(post.createdAt)}
                  </p>
                </div>

                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-zinc-300"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </a>
            )
          })}
        </div>
      ) : null}

      {children}
    </section>
  )
}
