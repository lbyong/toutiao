// 用户相关api

// 引入axios
import request from '@/utils/request'

/**
 * @param {Object} loginForm - 登录用户信息 (mobile，code)
 */
export const login = (loginForm) => {
  return request('/app/v1_0/authorizations', 'post', loginForm)
}

/**
 * 添加关注
 * @param {integer} userId - 用户id
 */
export const following = (userId) => {
  return request('/app/v1_0/user/followings', 'post', {
    target: userId
  })
}

/**
 * 取消关注
 * @param {integer} userId - 用户id
 */
export const unfollowing = (userId) => {
  return request(`/app/v1_0/user/followings/${userId}`, 'delete')
}

export const getUserInfo = () => {
  return request('/app/v1_0/user', 'get')
}

/**
 * 获取用户个人资料
 */
export const getUser = () => {
  return request('/app/v1_0/user/profile', 'get')
}

/**
 * 编辑资料-用户头像
 *  @param {file} photo - 头像文件对象
 */
export const editPhoto = (photo) => {
  // 修改头像需要基于formData表单对象
  const fd = new FormData() // 创建FormData对象
  fd.append('photo', photo) // 将图片对象添加到fd表单中
  return request('/app/v1_0/user/photo', 'patch', fd)
}

/**
 * 修改用户信息
 * @param {String} name - 用户名
 * @param {Integer} gender - 性别 0 男 1 女
 * @param {String} birthday - 生日
 */
export const editUserInfo = ({ name, gender, birthday }) => {
  return request('/app/v1_0/user/profile', 'patch', { name, gender, birthday })
}
