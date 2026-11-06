/**
 * 把原生小程序源码（native/）同步到预览目录（dist/build/mp-weixin/）。
 *
 * 为什么需要这一步：WorkBuddy 预览的小程序应用绑定在 dist/build/mp-weixin 上，
 * 原生小程序不再经过 uni-app 编译，所以直接把源码镜像过去即可。
 *
 * 用法：node scripts/sync-native.js
 */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const src = path.join(root, 'native')
const dest = path.join(root, 'dist', 'build', 'mp-weixin')

function rmrf(target) {
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true })
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true })
  for (const name of fs.readdirSync(from)) {
    const s = path.join(from, name)
    const d = path.join(to, name)
    const stat = fs.statSync(s)
    if (stat.isDirectory()) copyDir(s, d)
    else fs.copyFileSync(s, d)
  }
}

if (!fs.existsSync(src)) {
  console.error('未找到原生源码目录 native/')
  process.exit(1)
}

rmrf(dest)
copyDir(src, dest)

function count(dir) {
  let n = 0
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    n += fs.statSync(p).isDirectory() ? count(p) : 1
  }
  return n
}

console.log('已同步到', dest)
console.log('文件数:', count(dest))
