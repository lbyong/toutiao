// auth 认证
const KEY = 'toutiao'

// 获取认证用户信息
export const getUser = () => {
  return JSON.parse(localStorage.getItem(KEY) || '{}')
}

// 设置认证用户信息
export const setUser = (user) => {
  localStorage.setItem(KEY, JSON.stringify(user))
}

// 删除认证用户信息
export const delUser = () => {
  localStorage.removeItem(KEY)
}
