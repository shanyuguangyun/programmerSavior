import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import type { Section } from '../data/navigation'

type SidebarProps = {
  /** 当前 URL 对应的一级目录 */
  section: Section
}

/**
 * 左侧导航。
 *
 * 普通菜单和二级菜单都是 NavLink，点击后 URL 变化，页面由 router.tsx 匹配；
 * 带 children 的父项只负责折叠，本身不跳转。
 */
export function Sidebar({ section }: SidebarProps) {
  const { pathname } = useLocation()

  // 当前 URL 落在哪个折叠组里；用于自动展开对应分组。
  const activeGroupId =
    section.items.find((item) =>
      item.children?.some((child) => child.path === pathname),
    )?.id ?? null

  /**
   * 当前展开的折叠组。
   * 初始值取当前页面对应分组，确保直接打开子路由时菜单是展开的；
   * 路由变化时 App 会通过 key 重新挂载 Sidebar。
   */
  const [openGroupId, setOpenGroupId] = useState<string | null>(activeGroupId)

  // 移动端单独渲染二级菜单时，需要知道当前展开组的数据。
  const openGroup = section.items.find((item) => item.id === openGroupId)

  /** 折叠组父项只切换展开状态，不负责路由跳转。 */
  function toggleGroup(id: string) {
    setOpenGroupId((current) => (current === id ? null : id))
  }

  return (
    <aside className="min-w-0 border-b border-zinc-200 pb-3 md:w-32 md:shrink-0 md:border-b-0 md:pb-0">
      <p className="mb-2 hidden px-2 text-[11px] font-bold tracking-[0.18em] text-zinc-400 md:block">
        目录
      </p>

      {/* 移动端两列网格；md 以上恢复为纵向列表 */}
      <nav
        className="grid grid-cols-2 gap-1 pb-1 md:block md:space-y-1 md:pb-0"
        aria-label={`${section.label}菜单`}
      >
        {section.items.map((item) => {
          const hasActiveChild = item.children?.some(
            (child) => child.path === pathname,
          )
          const isOpen = item.id === openGroupId
          const Icon = item.icon

          // 普通菜单统一使用这套 class；折叠组传入 false，仅靠展开/子项状态高亮。
          const itemClass = (isActive: boolean) =>
            `flex w-full items-center gap-2 whitespace-nowrap rounded-lg px-2 py-2 text-[15px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200 ${
              isActive
                ? 'bg-violet-100 text-violet-700'
                : hasActiveChild
                  ? 'text-violet-700'
                  : isOpen
                    ? 'text-zinc-900'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`

          const iconClass = `h-4 w-4 shrink-0 ${
            hasActiveChild || isOpen ? 'text-violet-600' : 'text-zinc-400'
          }`

          // 普通菜单：真正跳转的路由链接。
          if (item.path) {
            return (
              <div key={item.id} className="min-w-0 md:block">
                <NavLink
                  to={item.path}
                  end
                  className={({ isActive }) => itemClass(isActive)}
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? 'text-violet-600' : 'text-zinc-400'
                        }`}
                        strokeWidth={1.9}
                      />
                      <span className="min-w-0 truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              </div>
            )
          }

          // 折叠组：只切换展开状态，不改变当前 URL。
          return (
            <div key={item.id} className="min-w-0 md:block">
              <button
                type="button"
                onClick={() => toggleGroup(item.id)}
                aria-expanded={isOpen}
                className={itemClass(false)}
              >
                <Icon className={iconClass} strokeWidth={1.9} />
                <span className="min-w-0 truncate">{item.label}</span>
                <ChevronDown
                  className={`ml-auto h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-violet-600' : 'text-zinc-400'
                  }`}
                  strokeWidth={2.4}
                  aria-hidden="true"
                />
              </button>

              {/* 桌面端：二级菜单展开在父项下方 */}
              {isOpen ? (
                <div className="mt-1 hidden space-y-0.5 pl-7 md:block">
                  {item.children?.map((child) => (
                    <NavLink
                      key={child.id}
                      to={child.path}
                      end
                      className={({ isActive }) =>
                        `block w-full rounded-lg px-2 py-1.5 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200 ${
                          isActive
                            ? 'bg-violet-100 text-violet-700'
                            : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                        }`
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </nav>

      {/*
        移动端：父项占一格，展开后的二级菜单单独放到下一行，
        避免挤在两列网格里。
      */}
      {openGroup?.children?.length ? (
        <div className="mt-2 flex items-center gap-1 overflow-x-auto md:hidden">
          {openGroup.children.map((child) => (
            <NavLink
              key={child.id}
              to={child.path}
              end
              className={({ isActive }) =>
                `shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200 ${
                  isActive
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                }`
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      ) : null}
    </aside>
  )
}
