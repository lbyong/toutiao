// 频道相关api

// 引入axios
import request from '@/utils/request'
import store from '@/store'

const KEY = 'toutiao-app'

// 获取首页频道列表，未登录获取后台默认频道
// 基于频道管理删除功能的修改
// 因为我的频道有登录和未登录状态，需要结合本地存储进项设置
export const getMyChannel = () => {
  // 获取我的频道有三种情况：需要返回一个Promise对象

  return new Promise(async (resolve, reject) => {
    // 1 已经登录   获取我的频道返回数据即可
    const { user } = store.state
    if (user.token) {
      // 1 已经登录   获取我的频道返回数据即可
      let data = await request('/app/v1_0/user/channels', 'get')
      resolve(data) // 成功获取数据返回data数据
    } else {
      // 2 未登录：获取本地缓存频道数据
      const localChannels = JSON.parse(window.localStorage.getItem(KEY) || '[]')
      // 检测是否存在本地缓存
      if (!localChannels.length) {
        // 需要获取默认的频道，本进行本地存储
        let data = await request('/app/v1_0/user/channels', 'get')
        window.localStorage.setItem(KEY, JSON.stringify(data.channels))
        resolve(data) // 成功获取数据返回data数据
      } else {
        // 本地已经缓存频道数据，返回本地存储的数据localChannels即可
        resolve({ channels: localChannels }) // 成功获取数据返回相同格式的本地数据
      }
    }
  })
}

/**
 *
 * @param {Integer} channelsId - 频道id
 */
export const delChannel = (channelsId) => {
  return new Promise(async (resolve, reject) => {
    // 1 已登录   直接发送请求删除
    const { user } = store.state
    if (user.token) {
      await request(`/app/v1_0/user/channels/${channelsId}`, 'delete')
      resolve()
    } else {
      // 2 未登录 在本地存储中进行删除
      // 获取本地存储的频道数据
      const localChannels = JSON.parse(window.localStorage.getItem(KEY) || '[]')
      // 删除本地存储的频道数据
      localChannels.splice(localChannels.findIndex(item => item.id === channelsId), 1)
      // 重新存储数据
      window.localStorage.setItem(KEY, JSON.stringify(localChannels))
      resolve()
    }
  })
}

// 获取全部频道
export const getAllChannels = () => {
  return request('/app/v1_0/channels', 'get')
}

/**
 *添加我的频道
 * @param {Array} orderChannels - 频道列表（包含id，name,seq）
 */
export const addChannel = (orderChannels) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 需要判读是否登录
      const { user } = store.state
      if (user.token) {
        // 已登录状态通过接口添加
        await request('/app/v1_0/user/channels', 'put', {
          channels: orderChannels // 频道列表（包含id，name）
        })
        resolve()
      } else {
        // 未登录状态通过本地存储添加
        const localChannels = JSON.parse(window.localStorage.getItem(KEY) || '[]')
        // 获取到请求中的orderChannels最新的数据（包含id，name）
        const { id, name } = orderChannels[localChannels.length - 1]
        localChannels.push({ id, name })
        // 重新存储到本地
        window.localStorage.setItem(KEY, JSON.stringify(localChannels))
        resolve()
      }
    } catch (err) {
      reject(err)
    }
  })
}
