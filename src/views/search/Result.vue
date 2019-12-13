<template>
    <div class="container">
    <!-- 导航固定定位 fixed -->
    <van-nav-bar fixed title="搜索结果" left-arrow @click-left="$router.back()" />
    <!-- 文章列表 -->
    <van-list v-model="loading" @load="onLoad" :finished="finished" finished-text="没有更多了">
      <van-cell-group>
        <van-cell :to="`/article/${item.art_id.toString()}`" v-for="item in articles" :key="item.art_id.toString()">
          <div class="article_item">
            <h3 class="van-ellipsis">{{item.title}}</h3>
            <div class="img_box" v-if="item.cover.type === 3">
              <van-image class="w33" fit="cover" :src="item.cover.images[0]" />
              <van-image class="w33" fit="cover" :src="item.cover.images[1]" />
              <van-image class="w33" fit="cover" :src="item.cover.images[2]" />
            </div>
            <div class="img_box" v-if="item.cover.type === 1">
              <van-image class="w100" fit="cover" :src="item.cover.images[0]" />
            </div>
            <div class="info_box">
              <span>{{item.aut_name}}</span>
              <span>{{item.comm_count}}评论</span>
              <span>{{item.pubdate|relTime}}</span>
            </div>
          </div>
        </van-cell>
      </van-cell-group>
    </van-list>
  </div>
</template>

<script>
import { searchArticles } from '@/api/article' // 搜索结果
export default {
  name: 'search-result',
  data () {
    return {
      loading: false, // 上拉刷新加载状态 false加载完成
      finished: false, // 上拉刷新加载数据  false还有数据未加载
      reqParams: {
        page: 1, // 默认显示页数
        q: this.$route.query.q // 当前结果关键字
      },
      articles: [] // 文章列表
    }
  },
  created () {
    this.onLoad()
  },
  methods: {
    // 搜索结果
    async onLoad () {
      this.$sleep()
      let data = await searchArticles(this.reqParams)
      this.articles.push(...data.results) // 追加数据
      // 结束加载效果
      this.loading = false
      // 判断如果加载完成一页内容自动加载下一页
      if (data.results.length) {
        this.reqParams.page++
      } else {
        // 完成数据加载
        this.finished = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  padding-top: 46px;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}
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
      height: 180px;
      width: 100%;
    }
  }
  .info_box {
    color: #999;
    line-height: 2;
    position: relative;
    span {
      padding-right: 10px;
    }
  }
}
</style>
