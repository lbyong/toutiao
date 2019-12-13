<template>
  <div class="container">
    <!-- :lazy-render  关闭延迟加载 -->
    <!-- @change  tabs频道改变事件 -->
    <van-tabs :lazy-render="false"  @change="changeChannel" swipeable v-model="activeIndex">
      <van-tab :key="channel.id" v-for="channel in myChannels" :title="channel.name">
        <!-- @scroll  内容滚动事件 -->
        <!-- $event  原生事件为事件对象，自定义事件为数据 -->
        <div ref="scroll-wrapper" class="scroll-wrapper" @scroll="remember($event)">
          <van-pull-refresh
            v-model="channel.downLoading"
            @refresh="onRefresh"
            :success-text="refreshSuccessText"
          >
            <van-list
              v-model="channel.upLoading"
              :finished="channel.finished"
              finished-text="我是有底线的"
              @load="onLoad"
            >
              <van-cell :to="`/article/${item.art_id.toString()}`" v-for="item in channel.articles" :key="item.art_id.toString()">
                <div class="article_item">
                  <h3 class="van-ellipsis">{{item.title}}</h3>
                  <div class="img_box" v-if="item.cover.type === 3">
                    <van-image lazy-load class="w33" fit="cover" :src="item.cover.images[0]" />
                    <van-image lazy-load class="w33" fit="cover" :src="item.cover.images[1]" />
                    <van-image lazy-load class="w33" fit="cover" :src="item.cover.images[2]" />
                  </div>
                  <div class="img_box"  v-if="item.cover.type === 1">
                    <van-image lazy-load class="w100" fit="cover" :src="item.cover.images[0]" />
                  </div>
                  <div class="info_box">
                    <span>{{item.aut_name}}</span>
                    <span>{{item.comm_count}}评论</span>
                    <span>{{item.pubdate|relTime}}</span>
                    <!-- 通过token来对按钮显示隐藏,点击对应更对操作的同时把对应的文章id传入 -->
                    <!-- 通过stop阻止按钮的冒泡事件 -->
                    <span class="close" v-if="user.token" @click.stop="openMoreAction(item.art_id.toString())">
                      <van-icon name="cross"></van-icon>
                    </span>
                  </div>
                </div>
              </van-cell>
            </van-list>
          </van-pull-refresh>
        </div>
      </van-tab>
    </van-tabs>
    <span class="bar_btn" slot="nav-right" @click="openChannelEdit()">
      <van-icon name="wap-nav"></van-icon>
    </span>
    <!-- 更多操作 -->
    <!-- :value="showMoreAction" @input="showMoreAction=$event" 通过v-model控制 -->
    <more-action @del="delArticle()" @report="delArticle()" v-model="showMoreAction" :articleId="articleId"></more-action>
    <!-- 频道管理 -->
    <!-- :activeIndex="activeIndex" @update="activeIndex=$event" 自定义双向绑定事件通过.sync控制 -->
    <channel-edit :activeIndex.sync="activeIndex" v-model="showChannelEdit" :myChannels="myChannels"></channel-edit>
  </div>
</template>

<script>
import { getMyChannel } from '@/api/channel' // 获取频道列表
import { getArticles } from '@/api/article' // 获取文章列表
import { mapState } from 'vuex'
import MoreAction from './components/more-action' // 引入更对操作子组件
import ChannelEdit from './components/channel-edit' // 引入频道管理子组件
export default {
  name: 'home-index',
  components: {
    MoreAction,
    ChannelEdit
  },
  data () {
    return {
      // upLoading: false, // 上拉刷新加载状态 false加载完成
      // finished: false, // 上拉刷新加载数据  false还有数据未加载
      // downLoading: false, // 下拉加载状态
      myChannels: [], // 频道列表
      articles: [], // 文章列表
      refreshSuccessText: '', // 文本
      activeIndex: 0, // 当前被激活频道下标
      showMoreAction: false, // 控制更多操作的显示隐藏
      showChannelEdit: false, // 控制频道管理显示隐藏
      articleId: null // 保存当前文章id
    }
  },
  created () {
    this.getMyChannels() // 获取频道列表
  },
  // 激活组件的生命周期钩子(触发：激活时，初始化时)
  activated () {
    // vue中使用ref可以拿到对应的DOM元素
    if (this.$refs['scroll-wrapper']) {
      // 记录 "当前" 文章列表容器的滚动位置
      const dom = this.$refs['scroll-wrapper'][this.activeIndex]
      // 把记录的滚动位置给到当前的文章列表容器
      dom.scrollTop = this.activeChannel.scrollTop
    }
  },
  computed: {
    activeChannel () {
      return this.myChannels[this.activeIndex] // 获取当前频
    },
    // 通过mapState获取vuex中的user数据包含token和refresh_token
    ...mapState(['user'])
  },
  watch: {
    // 监听user中的refresh_token数据变化(登录和未登录)
    'user.refresh_token': function () {
      // 默认激活推荐频道
      this.activeIndex = 0
      // 重新获取频道列表
      this.getMyChannels()
      // 获取对应的文章列表数据
      this.onLoad()
    }
  },
  methods: {
    // 显示频道管理
    openChannelEdit () {
      this.showChannelEdit = true
    },
    // 删除不感兴趣的文章
    delArticle () {
      // 首先获取当前文章列表
      let article = this.activeChannel.articles
      // 遍历数组获取id：findIndex()方法，并和当前拿到的id作比较
      let index = article.findIndex(item => item.art_id.toString() === this.articleId)
      article.splice(index, 1) // 通过对应的索引删除
    },
    // 显示隐藏更对操作
    openMoreAction (id) {
      this.showMoreAction = true
      this.articleId = id // 记录当前点击的文章id
    },
    // 文章列表滚动事件
    remember (e) {
      // 记录当前滚动的位置
      this.activeChannel.scrollTop = e.target.scrollTop
    },
    // 频道改变事件
    changeChannel () {
      // 判断当前频道是否有文章列表内容，无内容才进行加载
      if (!this.activeChannel.articles.length) {
        // 开启上滑加载效果
        this.activeChannel.upLoading = true
        // 无数据开启数据加载
        this.activeChannel.finished = false
        this.onLoad()
      } else {
        // 在切换频道后替换tab组件默认的滚动行为（需要延时到tab组件行为之后执行）
        // 可以通过延时定时器 setTimeout()
        // 可以通过vue提供的延时回调函数 $nextTick()
        this.$nextTick(() => {
          // 记录 "当前" 文章列表容器的滚动位置
          const dom = this.$refs['scroll-wrapper'][this.activeIndex]
          // 把记录的滚动位置给到当前的文章列表容器
          dom.scrollTop = this.activeChannel.scrollTop
        })
      }
    },
    // 获取频道列表
    async getMyChannels () {
      let data = await getMyChannel()
      // 在获取的属性中给每个频道独立追加新属性
      this.myChannels = [] // 清除tabs组件的默认缓存
      this.$nextTick(() => {
        this.myChannels = data.channels.map((item) => {
          return {
            id: item.id, // 频道id
            name: item.name, // 频道名称
            articles: [], // 频道对应文章列表
            upLoading: false, // 上滑加载
            downLoading: false, // 下拉刷新效果
            finished: false, // 继续数据加载
            timestamp: Date.now(), // 当前时间戳
            scrollTop: 0 // 阅读滚动位置
          }
        })
      })
    },
    // 上拉刷新获取当前频道的文章列表
    async onLoad () {
      // 如果没有拿到频道数据就不加载对应频道的文章列表
      if (!this.activeChannel) return false
      await this.$sleep() // 手动设置延时更新效果
      // window.setTimeout(() => {
      //   const data = []
      //   // 遍历文章列表
      //   for (let i = this.articles.length; i < this.articles.length + 10; i++) {
      //     data.push(i + 1)
      //   }
      //   this.articles.push(...data)
      //   this.upLoading = false // 结束加载状态
      //   if (this.articles.length >= 40) {
      //     this.finished = true // 完成数据加载
      //   }
      // }, 1500)
      // this.myChannels[this.activeIndex] // 当前频道
      // 传入id和时间戳
      let data = await getArticles(this.activeChannel.id, this.activeChannel.timestamp)
      // 将数据追到到当前频道的文章列表中
      this.activeChannel.articles.push(...data.results)
      // 结束加载效果
      this.activeChannel.upLoading = false
      // 通过时间戳判断是否还有数据需要加载
      if (data.pre_timestamp) {
        // 存储后台时间戳继续发送请求获取数据
        this.activeChannel.timestamp = data.pre_timestamp
      } else {
        this.activeChannel.finished = true // 无数据设置加载完成
      }
    },
    // 下拉加载
    async onRefresh () {
      await this.$sleep() // 手动设置延时更新效果
      // window.setTimeout(() => {
      //   const data = [] // 添加数据
      //   // 判断data是否有数据
      //   this.downLoading = false // 结束加载状态
      //   if (data.length) {
      //     this.articles = data // 获取数据
      //     this.refreshSuccessText = '更新成功' // 提示成功
      //     this.onLoad() // 刷新原内容
      //     this.finished = false // 未完成数据加载
      //   } else {
      //     this.refreshSuccessText = '暂无更新' // 无数据提示无更新
      //   }
      // }, 1500)

      // 把当前激活频道的时间戳改为当前时间
      this.activeChannel.timestamp = Date.now()
      // 获取数据
      let data = await getArticles(this.activeChannel.id, this.activeChannel.timestamp)
      // 结束加载效果
      this.activeChannel.downLoading = false
      // 判断是否有数据
      if (data.results.length) {
        // 替换当前数据
        this.activeChannel.articles = data.results
        this.refreshSuccessText = '更新成功'
        // 加载完一屏后，存储后台时间戳继续发送请求获取数据
        this.activeChannel.timestamp = data.pre_timestamp
        this.onLoad() // 主动继续加载
        this.finished = false // 未完成数据加载
      } else {
        this.refreshSuccessText = '暂无更新'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.van-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
  /deep/ .van-tabs__wrap {
    height: 36px;
    padding-right: 36px;
    .van-tab {
      line-height: 36px;
    }
    .van-tabs__line {
      background-color: #3296fa;
      height: 2px;
    }
  }
  /deep/ .van-tabs__content {
    flex: 1;
    overflow: hidden;
  }
  /deep/ .van-tab__pane {
    height: 100%;
    .scroll-wrapper {
      height: 100%;
      overflow-y: auto;
    }
  }
}
.bar_btn {
  width: 36px;
  height: 35px;
  position: absolute;
  top: 0;
  right: 0;
  &::before {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 999;
    box-shadow: 0 0 10px #999;
    transform: scale(1, 0.6);
  }
  .van-icon-wap-nav {
    width: 100%;
    height: 100%;
    background: #fff;
    text-align: center;
    line-height: 35px;
    position: relative;
    z-index: 1000;
    &::before {
      font-size: 20px;
    }
  }
}
// 列表样式
.article_item {
  h3 {
    font-weight: normal;
    line-height: 2;
  }
  .img_box {
    display: flex;
    justify-content: space-between;
    .w33 {
      width: 33%;
      height: 90px;
    }
    .w100 {
      width: 100%;
      height: 180px;
    }
  }
  .info_box {
    color: #999;
    line-height: 2;
    position: relative;
    font-size: 12px;
    span {
      padding-right: 10px;
      &.close {
        border: 1px solid #ddd;
        border-radius: 2px;
        line-height: 15px;
        height: 12px;
        width: 16px;
        text-align: center;
        padding-right: 0;
        font-size: 8px;
        position: absolute;
        right: 0;
        top: 7px;
      }
    }
  }
}
</style>
