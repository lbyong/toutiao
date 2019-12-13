<template>
  <div class="container">
    <van-nav-bar title="搜索中心" left-arrow @click-left="$router.back()" />
    <van-search v-model.trim="q" placeholder="请输入搜索关键词" shape="round" @search="onSearch" />
    <!-- 联想词条 -->
    <van-cell-group class="suggest-box" v-if="q">
      <van-cell @click="onSearch(item.replace(`<span>${q}</span>`, q))" icon="search" v-for="item in options" :key="item">
        <p v-html="item"></p>
      </van-cell>
    </van-cell-group>
    <!-- 历史记录:没有历史记录隐藏 -->
    <div class="history-box" v-else-if="historyList.length">
      <div class="head">
        <span>历史记录</span>
        <van-icon name="delete" @click="clearHistory()"></van-icon>
      </div>
      <van-cell-group>
        <van-cell v-for="(item,i) in historyList" :key="item">
          <a class="word_btn" @click="toSearch(item)">{{item}}</a>
          <van-icon @click="delHistory(i)" class="close_btn" slot="right-icon" name="cross" />
        </van-cell>
      </van-cell-group>
    </div>
  </div>
</template>

<script>
import { suggest } from '@/api/article'
export default {
  name: 'srarch-index',
  data () {
    return {
      q: '', // 搜索的关键字
      // 获取本地存储历史记录
      historyList: JSON.parse(window.localStorage.getItem('history') || '[]'),
      options: [], // 记录联想词条
      timer: null // 记录定时器
    }
  },
  watch: {
    q () {
      // 如果没有内容终止请求
      if (!this.q) {
        window.clearTimeout(this.timer)
        return false
      }
      // 通过函数防抖进行请求优化
      // 如果用户再次输入内容，清除定时器重新计时
      window.clearTimeout(this.timer)
      this.timer = window.setTimeout(async () => {
        let data = await suggest(this.q)
        // 通过span标签进行包裹
        this.options = data.options.map(item => item.toLowerCase().replace(this.q, `<span>${this.q}</span>`))
      }, 1000)
    }
  },
  methods: {
    // 清空历史记录
    clearHistory () {
      this.historyList = []
      // 删除本地存储
      window.localStorage.removeItem('history')
    },
    // 删除单条历史记录
    delHistory (index) {
      // 通过索引删除
      this.historyList.splice(index, 1)
      // 重新存储到本地
      window.localStorage.setItem('history', JSON.stringify(this.historyList))
      // 跳转到搜索结果页面
    },

    // 历史记录点击事件
    toSearch (item) {
      // 点击跳转到搜索结果页面，并把当前点击的关键字传入
      this.$router.push({ path: '/search/result', query: { q: item } })
    },

    // 确认搜索事件
    onSearch (val) {
      if (!val) return false // 无内容终止操作
      // 利用set方法进行去重操作
      let valSet = new Set(this.historyList)
      // 将val关键字追加到数组中
      valSet.add(val)
      // 将set集合转换为数组
      this.historyList = [...valSet]
      // 重新存储到本地
      window.localStorage.setItem('history', JSON.stringify(this.historyList))
      // 点击跳转到搜索结果页面，并把当前点击的关键字传入
      this.$router.push({ path: '/search/result', query: { q: val } })
    }
  }
}
</script>

<style lang="less" scoped>
// 历史记录样式
.history-box {
  padding: 0 20px;
  .head {
    line-height: 36px;
    color: #999;
    .van-icon {
      font-size: 16px;
      float: right;
      margin-top: 10px;
    }
  }
  .van-cell {
    padding: 10px 0;
  }
  .word_btn {
    color: #3296fa;
  }
  .close_btn {
    margin-top: 5px;
    color: #999;
  }
}
// 联想词条样式
.suggest-box{
  /deep/ .van-cell{
    padding: 10px 20px;
    color: #999;
    p{
      span{
        color: red;
      }
    }
  }
}
</style>
