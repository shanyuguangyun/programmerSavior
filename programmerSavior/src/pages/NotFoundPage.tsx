import { Link } from 'react-router-dom'
import { PagePlaceholder } from '../components/PagePlaceholder'

/** 没有匹配到路由时显示 */
export default function NotFoundPage() {
  return (
    <PagePlaceholder title="页面不存在" description="这个地址没有对应页面。">
      <Link
        to="/works"
        className="mt-4 inline-flex rounded-lg bg-violet-100 px-3 py-1.5 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-200"
      >
        返回全部作品
      </Link>
    </PagePlaceholder>
  )
}
