<template>
  <div class="container" @scroll="remember($event)" ref="container">
    <van-nav-bar fixed title="文章详情" left-arrow @click-left="$router.back()" />
    <div class="detail">
      <h3 class="title">{{article.title}}</h3>
      <div class="author">
        <van-image
          round
          width="1rem"
          height="1rem"
          fit="fill"
          :src="article.aut_photo"
        />
        <div class="text">
          <p class="name">{{article.aut_name}}</p>
          <p class="time">{{article.pubdate | relTime}}</p>
        </div>
        <!-- 通过article.is_followed的返回值动态设置是否已关注 -->
        <van-button :color="article.is_followed?'#ccc':''" @click="followde()" round size="small" type="info">{{article.is_followed?'已关注':'+ 关注'}}</van-button>
      </div>
      <div class="content">
        <p v-html="article.content">}</p>
      </div>
      <div class="zan">
        <van-button round @click="toggleAttitude(1)" size="small" :class="{active:article.attitude === 1}" plain icon="like-o">点赞</van-button>&nbsp;&nbsp;&nbsp;&nbsp;
        <van-button round @click="toggleAttitude(0)" size="small" :class="{active:article.attitude === 0}" plain icon="delete">不喜欢</van-button>
      </div>
      <comment></comment>
    </div>
  </div>
</template>

<script>
import { getArticle, disLikes, unDisLikes, likings, unLikings } from '@/api/article' // 获取文章详情
import { following, unfollowing } from '@/api/user' // 用户关注
import comment from './components/comment' // 评论组件
export default {
  name: 'home-article',
  components: { comment },
  data () {
    return {
      // 文章详情信息
      article: {
        art_id: '', // 记录文章id
        aut_id: '' // 用户id
      },
      scrollTop: 0 // 阅读位置
    }
  },
  activated () {
    // 条件：如果用户访问过该文章，并再次访问时不发送请求
    if (this.$route.params.id !== this.article.art_id.toString()) {
      this.scrollTop = 0 // 重置滚动位置
      this.getArticle() // 展示文章详情
    } else {
      // 通过ref获取当前滚动的dom对象
      this.$refs.container.scrollTop = this.scrollTop
    }
  },
  methods: {
    // 对文章点赞、不喜欢
    async toggleAttitude (btnType) {
      try {
        if (btnType === 1) {
        // 点赞操作
          if (this.article.attitude === 1) {
          // 取消点赞
            await unLikings(this.article.art_id)
            this.article.attitude = -1 // 改变按钮状态
          } else {
          // 点赞
            await likings(this.article.art_id)
            this.article.attitude = 1 // 改变按钮状态
          }
        } else {
        // 不喜欢操作
          if (this.article.attitude === 0) {
          // 取消喜欢
            await unDisLikes(this.article.art_id)
            this.article.attitude = -1 // 改变按钮状态
          } else {
          // 喜欢
            await disLikes(this.article.art_id)
            this.article.attitude = 0 // 改变按钮状态
          }
        }
        this.$toast.success('操作成功')
      } catch (e) {
        this.$toast.fail('操作失败')
      }
    },
    // 获取文章详情
    async getArticle () {
      let data = await getArticle(this.$route.params.id)
      this.article = data
    },
    // 内容滚动事件
    remember (e) {
      this.scrollTop = e.target.scrollTop
    },
    // 用户关注
    async followde () {
      try {
        if (this.article.is_followed) {
        // 取消关注
          await unfollowing(this.article.aut_id)
          this.$toast.success('取消关注成功')
          this.article.is_followed = false
        } else {
        // 添加关注
          await following(this.article.aut_id)
          this.$toast.success('关注成功')
          this.article.is_followed = true
        }
      } catch (e) {
        // this.$toast.fail('操作失败')
      }
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}
.detail {
  padding: 46px 20px 44px;
  height: 100%;
  .title {
    font-size: 18px;
    line-height: 2;
  }
  .zan{
    text-align: center;
    padding: 10px 0;
    .active{
      border-color:red;
      color: red;
    }
  }
  .author {
    padding: 10px 0;
    display: flex;
    .text {
      flex: 1;
      padding-left: 10px;
      line-height: 1.5;
      .name {
        font-size: 14px;
        margin: 0;
      }
      .time {
        margin: 0;
        font-size: 12px;
        color: #999;
      }
    }
  }
  // 内容中包含：img 特别宽  code pre 不能换行
  .content {
    padding: 20px 0;
    overflow: hidden;
    white-space: pre-wrap;
    word-break: break-all;
    /deep/ img{
      max-width:100%;
      background: #f9f9f9;
    }
    /deep/ code{
      white-space: pre-wrap;
    }
    /deep/ pre{
      white-space: pre-wrap;
    }
  }
}
</style>
