import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LoginModal } from './components/LoginModal'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { UploadModal } from './components/UploadModal'
import { getCurrentUser, logout } from './api/auth'
import { sections } from './data/navigation'

/**
 * 应用布局。
 *
 * React Router 会把匹配到的页面渲染到 <Outlet />，
 * 顶栏和侧栏在所有路由间保持不变。
 */
export default function App() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [username, setUsername] = useState<string | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)

  // 页面刷新后向后端确认是否已有登录 Session。
  useEffect(() => {
    let active = true

    getCurrentUser().then((currentUsername) => {
      if (active && currentUsername) {
        setUsername(currentUsername)
      }
    })

    return () => {
      active = false
    }
  }, [])

  // 根据 URL 前缀判断当前一级目录；未匹配时回退到作品。
  const activeSection =
    sections.find(
      (section) =>
        pathname === section.path ||
        pathname.startsWith(`${section.path}/`),
    ) ?? sections[0]

  /**
   * 退出登录。
   * 即使退出接口暂时不可用，也先清掉前端登录态；
   * 服务端 Session 失效后，下次刷新仍然会回到未登录状态。
   */
  async function handleLogout() {
    try {
      await logout()
    } catch {
      // 退出失败不阻塞前端清理登录态
    } finally {
      setUsername(null)
      setLoginOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <TopBar
        username={username}
        onLoginClick={() => setLoginOpen(true)}
        onUploadClick={() => setUploadOpen(true)}
        onLogout={handleLogout}
      />

      {/* 桌面端左右分栏，移动端自动改为上下排列 */}
      <div className="flex w-full flex-col gap-4 px-4 py-5 sm:px-5 md:min-h-[calc(100vh-4rem)] md:flex-row md:gap-[50px] md:px-[50px] md:py-8">
        {/*
          key 绑定目录和路径：路由变化时重新挂载 Sidebar，
          让折叠组根据目标页面重新初始化，同时避免在 effect 中同步 setState。
        */}
        <Sidebar key={`${activeSection.id}-${pathname}`} section={activeSection} />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      {/* 登录弹窗只在点击头像后挂载 */}
      {loginOpen ? (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSuccess={setUsername}
        />
      ) : null}

      {/*
        上传成功后跳到目标路由；state 里的时间戳用于强制生成新的 location.key，
        让页面重新请求该目录下的 HTML。
      */}
      {uploadOpen ? (
        <UploadModal
          onClose={() => setUploadOpen(false)}
          onUploaded={(routePath) => {
            setUploadOpen(false)
            navigate(routePath, {
              state: { uploadedAt: Date.now() },
            })
          }}
        />
      ) : null}
    </div>
  )
}
