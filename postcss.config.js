module.exports = {
  plugins: {
    'autoprefixer': {}, // 兼容问题处理，自动加私有前缀
    'postcss-pxtorem': { // px转换为rem
      rootValue: 37.5, // rem的基准值
      propList: ['*'] // 所有的px属性都替换为rem
    }
  }
}
