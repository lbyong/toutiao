module.exports = {
  lintOnSave: true,
  devServer: {
    open: true,
    port: 8787
  },
  // 配置vant覆盖原有主题色
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          'blue': '#3296fa'
        }
      }
    }
  },
  publicPath: './'
}
