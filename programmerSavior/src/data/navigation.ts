import type { LucideIcon } from 'lucide-react'
import {
  Archive,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  Feather,
  FileText,
  FolderKanban,
  Layers3,
  Lightbulb,
  NotebookPen,
  PenLine,
  Sparkles,
} from 'lucide-react'

/**
 * 导航数据。
 *
 * 所有选中状态现在由 URL 驱动：
 * - section.path 是一级目录路径
 * - 普通菜单项通过 path 指向一个路由页面
 * - 有 children 的菜单项只负责折叠，不单独跳转
 * - 所有 id 必须全局唯一
 */
export type SectionId = 'works' | 'articles' | 'essays'

/** 二级菜单项，必须有对应路由 */
export type MenuChild = {
  /** 全局唯一 id */
  id: string
  /** 展示名称 */
  label: string
  /** 对应的路由地址 */
  path: string
}

/** 左侧一级菜单项 */
export type SidebarItem = {
  id: string
  label: string
  /** 菜单图标 */
  icon: LucideIcon
  /** 普通菜单项的路由；有 children 时可以为空 */
  path?: string
  /** 存在子项时渲染成折叠组 */
  children?: MenuChild[]
}

/** 一个一级目录 */
export type Section = {
  id: SectionId
  label: string
  /** 一级目录根路径 */
  path: string
  icon: LucideIcon
  /** 左侧一级菜单 */
  items: SidebarItem[]
}

/**
 * 顶栏、侧栏和路由页面共用这一份导航数据。
 * 页面本身只负责占位，不在这里维护展示内容。
 */
export const sections: Section[] = [
  // 作品
  {
    id: 'works',
    label: '作品',
    path: '/works',
    icon: BriefcaseBusiness,
    items: [
      { id: 'works-all', label: '全部作品', icon: Layers3, path: '/works' },
      {
        id: 'works-projects',
        label: '项目',
        icon: FolderKanban,
        children: [
          {
            id: 'works-projects-active',
            label: '进行中',
            path: '/works/projects/active',
          },
          {
            id: 'works-projects-done',
            label: '已完成',
            path: '/works/projects/done',
          },
          {
            id: 'works-projects-archived',
            label: '已归档',
            path: '/works/projects/archived',
          },
        ],
      },
      {
        id: 'works-drafts',
        label: '灵感草稿',
        icon: Lightbulb,
        path: '/works/drafts',
      },
      {
        id: 'works-recent',
        label: '最近更新',
        icon: Clock3,
        path: '/works/recent',
      },
    ],
  },

  // 文章
  {
    id: 'articles',
    label: '文章',
    path: '/articles',
    icon: FileText,
    items: [
      {
        id: 'articles-all',
        label: '全部文章',
        icon: FileText,
        path: '/articles',
      },
      {
        id: 'articles-notes',
        label: '技术笔记',
        icon: NotebookPen,
        children: [
          {
            id: 'articles-notes-frontend',
            label: '前端',
            path: '/articles/notes/frontend',
          },
          {
            id: 'articles-notes-backend',
            label: '后端',
            path: '/articles/notes/backend',
          },
          {
            id: 'articles-notes-tools',
            label: '工具',
            path: '/articles/notes/tools',
          },
        ],
      },
      {
        id: 'articles-reading',
        label: '读书摘要',
        icon: BookOpen,
        path: '/articles/reading',
      },
      {
        id: 'articles-longform',
        label: '长文计划',
        icon: PenLine,
        path: '/articles/longform',
      },
    ],
  },

  // 随笔
  {
    id: 'essays',
    label: '随笔',
    path: '/essays',
    icon: Feather,
    items: [
      { id: 'essays-all', label: '全部随笔', icon: Feather, path: '/essays' },
      {
        id: 'essays-journal',
        label: '日常记录',
        icon: CalendarDays,
        path: '/essays/journal',
      },
      {
        id: 'essays-thoughts',
        label: '随手想法',
        icon: Sparkles,
        path: '/essays/thoughts',
      },
      {
        id: 'essays-archive',
        label: '年度归档',
        icon: Archive,
        children: [
          {
            id: 'essays-archive-2026',
            label: '2026',
            path: '/essays/archive/2026',
          },
          {
            id: 'essays-archive-2025',
            label: '2025',
            path: '/essays/archive/2025',
          },
          {
            id: 'essays-archive-earlier',
            label: '更早',
            path: '/essays/archive/earlier',
          },
        ],
      },
    ],
  },
]
