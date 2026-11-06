import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from './App'
import ArticlesAllPage from './pages/articles/ArticlesAllPage'
import ArticlesBackendPage from './pages/articles/ArticlesBackendPage'
import ArticlesFrontendPage from './pages/articles/ArticlesFrontendPage'
import ArticlesLongformPage from './pages/articles/ArticlesLongformPage'
import ArticlesReadingPage from './pages/articles/ArticlesReadingPage'
import ArticlesToolsPage from './pages/articles/ArticlesToolsPage'
import EssaysAllPage from './pages/essays/EssaysAllPage'
import EssaysArchive2025Page from './pages/essays/EssaysArchive2025Page'
import EssaysArchive2026Page from './pages/essays/EssaysArchive2026Page'
import EssaysArchiveEarlierPage from './pages/essays/EssaysArchiveEarlierPage'
import EssaysJournalPage from './pages/essays/EssaysJournalPage'
import EssaysThoughtsPage from './pages/essays/EssaysThoughtsPage'
import NotFoundPage from './pages/NotFoundPage'
import ReaderPage from './pages/ReaderPage'
import WorksActivePage from './pages/works/WorksActivePage'
import WorksAllPage from './pages/works/WorksAllPage'
import WorksArchivedPage from './pages/works/WorksArchivedPage'
import WorksDonePage from './pages/works/WorksDonePage'
import WorksDraftsPage from './pages/works/WorksDraftsPage'
import WorksRecentPage from './pages/works/WorksRecentPage'

/**
 * 路由表。
 *
 * App 是主站布局路由；ReaderPage 是独立阅读页，不经过侧栏。
 */
export const router = createBrowserRouter([
  // 新标签页打开的独立文章页
  { path: '/reader/:postId', element: <ReaderPage /> },

  {
    path: '/',
    element: <App />,
    children: [
      // 根路径默认进入全部作品
      { index: true, element: <Navigate to="/works" replace /> },

      // 作品
      { path: 'works', element: <WorksAllPage /> },
      {
        path: 'works/projects',
        element: <Navigate to="/works/projects/active" replace />,
      },
      { path: 'works/projects/active', element: <WorksActivePage /> },
      { path: 'works/projects/done', element: <WorksDonePage /> },
      {
        path: 'works/projects/archived',
        element: <WorksArchivedPage />,
      },
      { path: 'works/drafts', element: <WorksDraftsPage /> },
      { path: 'works/recent', element: <WorksRecentPage /> },

      // 文章
      { path: 'articles', element: <ArticlesAllPage /> },
      {
        path: 'articles/notes',
        element: <Navigate to="/articles/notes/frontend" replace />,
      },
      {
        path: 'articles/notes/frontend',
        element: <ArticlesFrontendPage />,
      },
      { path: 'articles/notes/backend', element: <ArticlesBackendPage /> },
      { path: 'articles/notes/tools', element: <ArticlesToolsPage /> },
      { path: 'articles/reading', element: <ArticlesReadingPage /> },
      { path: 'articles/longform', element: <ArticlesLongformPage /> },

      // 随笔
      { path: 'essays', element: <EssaysAllPage /> },
      { path: 'essays/journal', element: <EssaysJournalPage /> },
      { path: 'essays/thoughts', element: <EssaysThoughtsPage /> },
      {
        path: 'essays/archive',
        element: <Navigate to="/essays/archive/2026" replace />,
      },
      { path: 'essays/archive/2026', element: <EssaysArchive2026Page /> },
      { path: 'essays/archive/2025', element: <EssaysArchive2025Page /> },
      {
        path: 'essays/archive/earlier',
        element: <EssaysArchiveEarlierPage />,
      },
      // 其他地址统一显示 404 页面
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
