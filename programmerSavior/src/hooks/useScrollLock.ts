import { useEffect } from 'react'

/**
 * 弹窗打开时锁定页面滚动。
 *
 * 仅设置 overflow: hidden 会让滚动条消失，页面会因为多出滚动条宽度而横向抖动。
 * 这里先计算滚动条宽度，再用 padding-right 把这段空间补回来，关闭时恢复原值。
 */
export function useScrollLock() {
  useEffect(() => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth
    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight

    if (scrollbarWidth > 0) {
      const currentPaddingRight =
        Number.parseFloat(window.getComputedStyle(document.body).paddingRight) ||
        0
      document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`
    }
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
    }
  }, [])
}
