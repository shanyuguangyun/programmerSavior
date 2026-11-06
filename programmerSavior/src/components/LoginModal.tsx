import { useEffect, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { login } from '../api/auth'
import { useScrollLock } from '../hooks/useScrollLock'

type LoginModalProps = {
  /** 关闭弹窗 */
  onClose: () => void
  /** 登录成功后把用户名交给布局组件 */
  onSuccess: (username: string) => void
}

/**
 * 登录弹窗。
 *
 * 只提供账号密码登录，没有注册、找回密码或第三方登录入口。
 */
export function LoginModal({ onClose, onSuccess }: LoginModalProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 锁定背景滚动，并补偿滚动条宽度，避免页面横向抖动。
  useScrollLock()

  // 支持 Esc 关闭弹窗；组件只在打开时挂载，所以监听可以随组件一起清理。
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !submitting) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, submitting])

  /**
   * 提交登录：
   * 1. 前端只做非空校验；
   * 2. 账号密码交给后端校验；
   * 3. 成功后关闭弹窗并回传用户名。
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!username.trim() || !password) {
      setError('请输入账号和密码')
      return
    }

    setSubmitting(true)
    try {
      const result = await login(username.trim(), password)
      onSuccess(result.username)
      onClose()
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : '登录失败，请稍后重试',
      )
    } finally {
      setSubmitting(false)
    }
  }

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
        aria-labelledby="login-title"
        className="w-full max-w-[360px] rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_24px_80px_-24px_rgba(24,24,27,0.35)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="login-title"
              className="text-xl font-bold tracking-tight text-zinc-900"
            >
              登录
            </h2>
            <p className="mt-1 text-[13px] leading-5 text-zinc-500">
              登录后继续使用 Programmer Savior。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="关闭登录框"
            className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-zinc-700">
              账号
            </span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              autoFocus
              disabled={submitting}
              placeholder="请输入账号"
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-zinc-50"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-zinc-700">
              密码
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              disabled={submitting}
              placeholder="请输入密码"
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-zinc-50"
            />
          </label>

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
            {submitting ? '登录中…' : '登录'}
          </button>
        </form>
      </div>
    </div>
  )
}
