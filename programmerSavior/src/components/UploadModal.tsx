import { useEffect, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { sections, type SectionId } from '../data/navigation'
import { uploadPost } from '../api/posts'
import { useScrollLock } from '../hooks/useScrollLock'

type UploadModalProps = {
  /** 关闭弹窗 */
  onClose: () => void
  /** 上传成功后的目标路由，由布局组件负责跳转 */
  onUploaded: (routePath: string) => void
}

type Selection = {
  sectionId: SectionId
  menuId: string
  childId: string
}

/**
 * 从当前 URL 反推目录选择，让上传弹窗默认落在当前页面。
 */
function findSelection(pathname: string): Selection {
  for (const section of sections) {
    if (
      pathname === section.path ||
      pathname.startsWith(`${section.path}/`)
    ) {
      for (const item of section.items) {
        if (item.path === pathname) {
          return {
            sectionId: section.id,
            menuId: item.id,
            childId: '',
          }
        }

        const child = item.children?.find((entry) => entry.path === pathname)
        if (child) {
          return {
            sectionId: section.id,
            menuId: item.id,
            childId: child.id,
          }
        }
      }

      const firstMenu = section.items[0]
      return {
        sectionId: section.id,
        menuId: firstMenu.id,
        childId: firstMenu.children?.[0]?.id ?? '',
      }
    }
  }

  const firstSection = sections[0]
  const firstMenu = firstSection.items[0]
  return {
    sectionId: firstSection.id,
    menuId: firstMenu.id,
    childId: firstMenu.children?.[0]?.id ?? '',
  }
}

/**
 * 上传 HTML 弹窗。
 *
 * 只负责选目录、选文件并提交；
 * 标题、首图和正文文本由后端解析，前端不解析 HTML。
 */
export function UploadModal({ onClose, onUploaded }: UploadModalProps) {
  const { pathname } = useLocation()
  const [selection, setSelection] = useState<Selection>(() =>
    findSelection(pathname),
  )
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 锁定背景滚动，并补偿滚动条宽度，避免打开弹窗时页面抖动。
  useScrollLock()

  // 一级、二级、三级目录的派生数据。
  const section =
    sections.find((entry) => entry.id === selection.sectionId) ?? sections[0]
  const menu =
    section.items.find((entry) => entry.id === selection.menuId) ??
    section.items[0]
  const children = menu.children ?? []
  const child = children.find((entry) => entry.id === selection.childId)

  // 有三级目录时以三级路径为准，否则使用二级目录路径。
  const routePath = child?.path ?? menu.path

  // Esc 关闭弹窗。
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !submitting) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, submitting])

  /** 切换一级目录时，二级和三级选择重置到该目录第一项。 */
  function handleSectionChange(sectionId: SectionId) {
    const nextSection =
      sections.find((entry) => entry.id === sectionId) ?? sections[0]
    const nextMenu = nextSection.items[0]

    setSelection({
      sectionId: nextSection.id,
      menuId: nextMenu.id,
      childId: nextMenu.children?.[0]?.id ?? '',
    })
    setError('')
  }

  /** 切换二级目录时，三级选择重置到第一个子项。 */
  function handleMenuChange(menuId: string) {
    const nextMenu = section.items.find((entry) => entry.id === menuId)
    if (!nextMenu) return

    setSelection((current) => ({
      ...current,
      menuId,
      childId: nextMenu.children?.[0]?.id ?? '',
    }))
    setError('')
  }

  /** 切换文件时清空上一次的错误提示。 */
  function handleFileChange(nextFile: File | null) {
    setFile(nextFile)
    setError('')
  }

  /**
   * 校验文件并提交：
   * 后端还会再做一次文件类型、大小和登录校验。
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!routePath) {
      setError('请选择完整目录')
      return
    }
    if (!file) {
      setError('请选择 HTML 文件')
      return
    }

    const lowerName = file.name.toLowerCase()
    if (!lowerName.endsWith('.html') && !lowerName.endsWith('.htm')) {
      setError('只允许上传 .html 或 .htm 文件')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('HTML 文件不能超过 2MB')
      return
    }

    const formData = new FormData()
    formData.append('sectionId', section.id)
    formData.append('sectionLabel', section.label)
    formData.append('menuId', menu.id)
    formData.append('menuLabel', menu.label)
    if (child) {
      formData.append('childId', child.id)
      formData.append('childLabel', child.label)
    }
    formData.append('routePath', routePath)
    formData.append('file', file)

    setSubmitting(true)
    try {
      const post = await uploadPost(formData)
      onUploaded(post.routePath)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : '上传失败，请稍后重试',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const selectClass =
    'h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-zinc-50'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/30 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-title"
        className="max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_24px_80px_-24px_rgba(24,24,27,0.35)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="upload-title"
              className="text-xl font-bold tracking-tight text-zinc-900"
            >
              上传 HTML
            </h2>
            <p className="mt-1 text-[13px] leading-5 text-zinc-500">
              选择目录和 HTML 文件，上传后会直接展示在对应页面。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="关闭上传框"
            className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-zinc-700">
              一级目录
            </span>
            <select
              value={selection.sectionId}
              onChange={(event) =>
                handleSectionChange(event.target.value as SectionId)
              }
              disabled={submitting}
              className={selectClass}
            >
              {sections.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-zinc-700">
              二级目录
            </span>
            <select
              value={menu.id}
              onChange={(event) => handleMenuChange(event.target.value)}
              disabled={submitting}
              className={selectClass}
            >
              {section.items.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>

          {children.length > 0 ? (
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-zinc-700">
                三级目录
              </span>
              <select
                value={child?.id ?? ''}
                onChange={(event) =>
                  setSelection((current) => ({
                    ...current,
                    childId: event.target.value,
                  }))
                }
                disabled={submitting}
                className={selectClass}
              >
                {children.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div>
            <span className="mb-1.5 block text-[13px] font-semibold text-zinc-700">
              HTML 文件
            </span>
            <label
              htmlFor="post-html-file"
              className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50/70 px-3 py-3 transition-colors hover:border-violet-300 hover:bg-violet-50/40"
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-zinc-700">
                  {file ? file.name : '选择 HTML 文件'}
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-400">
                  支持 .html / .htm，最大 2MB
                </p>
              </div>
              <span className="shrink-0 rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] font-semibold text-zinc-500">
                浏览
              </span>
            </label>
            <input
              id="post-html-file"
              type="file"
              accept=".html,.htm,text/html"
              disabled={submitting}
              onChange={(event) =>
                handleFileChange(event.target.files?.[0] ?? null)
              }
              className="sr-only"
            />
          </div>

          <p className="text-[11px] leading-5 text-zinc-400">
            标题、首图和正文文本会自动解析；没有图片时使用默认封面。
          </p>

          {error ? (
            <p role="alert" className="text-[13px] leading-5 text-red-600">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="flex h-10 w-full items-center justify-center rounded-lg bg-violet-600 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-violet-300"
          >
            {submitting ? '上传中…' : '上传并展示'}
          </button>
        </form>
      </div>
    </div>
  )
}
