import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import './index.css'

/**
 * React 入口。
 *
 * RouterProvider 接管页面渲染，路由表放在 src/router.tsx；
 * StrictMode 只在开发环境帮助发现副作用问题。
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
