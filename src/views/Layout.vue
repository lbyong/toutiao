<template>
    <div class="container">
        <!-- 导航栏 -->
        <van-nav-bar v-if="showNav" title="黑马头条" right-text="搜索" fixed @click-right="$router.push('/search')"/>
        <!-- 内容区域 -->
        <div class="my-wrapper" :class="{noTop:!showNav}" >
          <router-view></router-view>
        </div>
        <!-- 标签栏 -->
        <van-tabbar route>
          <van-tabbar-item to="/" icon="wap-home-o">首页</van-tabbar-item>
          <van-tabbar-item to="/question"  icon="chat-o">问答</van-tabbar-item>
          <van-tabbar-item to="/video"  icon="video-o">视频</van-tabbar-item>
          <van-tabbar-item to="/user"  icon="user-o">我的</van-tabbar-item>
        </van-tabbar>
    </div>
</template>

<script>
export default {
  name: 'Layout',
  computed: {
    // 如果当前页面的url不是/user就显示
    // this.$route.path 获取当前页面#后的地址
    showNav () {
      return this.$route.path !== '/user'
    }
  }
}
</script>

<style lang="less" scoped>
.container{
  width: 100%;
  height: 100%;
  position: relative;
  .my-wrapper{
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding-top: 46px;
    padding-bottom: 50px;
    box-sizing: border-box;
    &.noTop{
      padding-top: 0;
    }
  }
}
</style>
