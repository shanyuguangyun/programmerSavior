import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LogOut, Search, Upload } from 'lucide-react'
import { sections } from '../data/navigation'

/**
 * 顶栏组件。
 *
 * 一级目录使用 NavLink，由 URL 自动判断选中状态；
 * 登录后显示上传图标和账号菜单，账号菜单里可以退出登录。
 */
type TopBarProps = {
  /** 已登录账号；未登录时为 null */
  username: string | null
  /** 点击头像时打开登录弹窗 */
  onLoginClick: () => void
  /** 点击上传图标时打开上传 HTML 弹窗 */
  onUploadClick: () => void
  /** 点击退出登录 */
  onLogout: () => void | Promise<void>
}

export function TopBar({
  username,
  onLoginClick,
  onUploadClick,
  onLogout,
}: TopBarProps) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)

  return (
    <header className="border-b border-zinc-200/80 bg-white">
      <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:px-5 md:h-16 md:flex-nowrap md:gap-6 md:px-[50px] md:py-0">
        {/* 品牌区 */}
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-[11px] font-bold tracking-tight text-white"
            aria-hidden="true"
          >
            PS
          </span>
          <span className="text-[15px] font-bold tracking-tight text-zinc-900">
            Programmer Savior
          </span>
        </div>

        {/* 一级目录与搜索区域 */}
        <div className="order-3 flex w-full min-w-0 items-center gap-2 md:order-none md:contents">
          <nav
            className="flex shrink-0 items-center gap-0.5"
            aria-label="一级目录"
          >
            {sections.map((section) => (
              <NavLink
                key={section.id}
                to={section.path}
                className={({ isActive }) =>
                  `shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200 ${
                    isActive
                      ? 'bg-violet-100 text-violet-700'
                      : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                  }`
                }
              >
                {section.label}
              </NavLink>
            ))}
          </nav>

          {/*
            搜索框目前只是界面占位：
            readOnly 阻止输入，隐藏说明文字供读屏软件读取。
          */}
          <div className="relative min-w-0 flex-1 md:ml-auto md:w-44 md:flex-none lg:w-56">
            <label htmlFor="global-search" className="sr-only">
              搜索
            </label>
            <span id="global-search-note" className="sr-only">
              搜索功能暂未实现，仅展示界面。
            </span>
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            />
            <input
              id="global-search"
              type="search"
              readOnly
              aria-describedby="global-search-note"
              placeholder="搜索"
              title="搜索功能暂未实现"
              className="h-8 w-full rounded-lg border border-zinc-200 bg-white pl-8 pr-3 text-[13px] text-zinc-700 outline-none transition placeholder:text-zinc-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>

        {/* 右侧操作区：上传图标、账号菜单、登录入口 */}
        <div className="relative order-2 ml-auto flex items-center gap-1 md:order-none md:ml-0">
          {username ? (
            <button
              type="button"
              onClick={onUploadClick}
              aria-label="上传 HTML"
              title="上传 HTML"
              className="mr-2.5 flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200"
            >
              <Upload className="h-4 w-4" strokeWidth={2.1} />
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => {
              if (username) {
                setAccountMenuOpen((current) => !current)
              } else {
                onLoginClick()
              }
            }}
            aria-label={username ? `账号菜单：${username}` : '登录'}
            title={username ? `账号菜单：${username}` : '登录'}
            aria-haspopup={username ? 'menu' : undefined}
            aria-expanded={username ? accountMenuOpen : undefined}
            className={`flex items-center gap-2 rounded-full p-0.5 pr-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200 focus-visible:ring-offset-2 ${
              username ? 'hover:bg-zinc-100' : ''
            }`}
          >
            {username ? (
              <span className="hidden max-w-24 truncate text-[13px] font-semibold text-zinc-500 sm:inline">
                {username}
              </span>
            ) : null}
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
              {username ? username.charAt(0).toUpperCase() : 'P'}
            </span>
          </button>

          {username && accountMenuOpen ? (
            <>
              {/* 透明遮罩：点击菜单外部关闭 */}
              <button
                type="button"
                tabIndex={-1}
                aria-label="关闭账号菜单"
                onClick={() => setAccountMenuOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />
              <div
                role="menu"
                aria-label="账号菜单"
                className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_18px_48px_-20px_rgba(24,24,27,0.35)]"
              >
                <div className="border-b border-zinc-100 px-3 py-2.5">
                  <p className="truncate text-[13px] font-bold text-zinc-800">
                    {username}
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-400">已登录</p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setAccountMenuOpen(false)
                    void onLogout()
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                >
                  <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
                  退出登录
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  )
}
