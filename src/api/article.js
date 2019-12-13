// 文章相关api

// 引入axios
import request from '@/utils/request'

/**
 * 获取文章列表
 * @param {Integer} channelId  频道id
 * @param {Integer} timestamp  时间戳=页码功能
 */
export const getArticles = (channelId, timestamp) => {
  return request('app/v1_1/articles', 'get', {
    channel_id: channelId,
    timestamp,
    with_top: 1
  })
}

/**
 * 对文章不感兴趣
 * @param {String} articleId - 文章id
 */
export const disLikes = (articleId) => {
  return request('/app/v1_0/article/dislikes', 'post', {
    target: articleId
  })
}

/**
 * 对文章感兴趣
 * @param {String} articleId - 文章id
 */
export const unDisLikes = (articleId) => {
  return request(`/app/v1_0/article/dislikes/${articleId}`, 'delete')
}

/**
 * 对文章点赞
 * @param {String} articleId - 文章id
 */
export const likings = (articleId) => {
  return request('/app/v1_0/article/likings', 'post', {
    target: articleId
  })
}

/**
 * 取消点赞
 * @param {String} articleId - 文章id
 */
export const unLikings = (articleId) => {
  return request(`/app/v1_0/article/likings/${articleId}`, 'delete')
}

/**
 *举报文章
 * @param {integer} articleId - 文章id
 * @param {integer} type - 举报类型
 */
export const report = (articleId, type) => {
  return request('/app/v1_0/article/reports', 'post', {
    target: articleId,
    type
  })
}

/**
 * 联想词条
 * @param {String} q - 搜索关键词
 */
export const suggest = (q) => {
  return request('/app/v1_0/suggestion', 'get', { q })
}

/**
 * 搜索文章
 * @param {Integer} page - 页码
 * @param {Integer} perPage - 每页多少条
 * @param {String} q - 搜索关键字
 */
export const searchArticles = ({ page = 1, perPage = 10, q }) => {
  return request('/app/v1_0/search', 'get', {
    page,
    per_page: perPage,
    q
  })
}

/**
 *获取文章详情
 * @param {String} articleId - 文章id
 */
export const getArticle = (articleId) => {
  return request(`/app/v1_0/articles/${articleId}`, 'get')
}

/**
 *
 * @param {String} type - 类型  a：评论   c：回复
 * @param {String} source - 文章id或评论id
 * @param {String} offset - 偏移量：类似时间戳
 * @param {String} limit - 评论个数
 */
export const getComment = ({ type, source, offset, limit = 10 }) => {
  return request('/app/v1_0/comments', 'get', { type, source, offset, limit })
}

/**
 *添加评论、回复
 * @param {integer} target - 评论、回复id
 * @param {string} content - 评论内容
 * @param {integer} artId - 文章id
 */
export const addComment = (target, content, artId = null) => {
  return request('/app/v1_0/comments', 'post', {
    target,
    content,
    art_id: artId
  })
}

/**
 *评论点赞
 * @param {integer} target - 评论id
 */
export const commentLikings = (target) => {
  return request('/app/v1_0/comment/likings', 'post', { target })
}
