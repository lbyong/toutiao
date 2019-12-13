<template>
  <div class="comment">
    <!-- :immediate-check="false" 禁用@load默认加载一次 -->
    <van-list @load="getComments" :immediate-check="false" v-model="loading" :finished="finished" finished-text="没有更多评论了">
      <div class="item van-hairline--bottom van-hairline--top" v-for="item in commentList" :key="item.art_id">
        <van-image round width="1rem" height="1rem" fit="fill" :src="item.aut_photo" />
        <div class="info">
          <p>
            <span class="name">{{item.aut_name}}</span>
            <span style="float:right" @click="commentLikes(item.com_id.toString())">
              <span class="van-icon van-icon-good-job-o zan"></span>
              <span class="count">{{item.like_count}}</span>
            </span>
          </p>
          <p>{{item.content}}</p>
          <p>
            <span class="time">{{item.pubdate | relTime}}</span>&nbsp;
            <van-tag plain @click="openReplyDialog(item.com_id.toString())">{{item.reply_count}} 回复</van-tag>
          </p>
        </div>
      </div>
    </van-list>

    <!-- 底部输入框 -->
    <div class="reply-container van-hairline--top">
      <van-field v-model.trim="value" :placeholder="showReply?'写回复...':'写评论...'">
        <van-loading v-if="commentLoading" slot="button" type="spinner" size="16px">
        </van-loading>
        <span class="submit" @click="submit()" v-else slot="button">提交</span>
      </van-field>
    </div>

    <!-- 回复弹出层 -->
    <van-action-sheet :immediate-check="false" @load="getReplys" v-model="showReply" class="reply_dailog" title="回复评论">
      <van-list v-model="reply.loading" :finished="reply.finished" finished-text="没有更多了">
        <div class="item van-hairline--bottom van-hairline--top" v-for="item in reply.list" :key="item.com_id.toString()">
          <van-image round width="1rem" height="1rem" fit="fill" :src="item.aut_photo" />
          <div class="info">
            <p><span class="name">{{item.aut_name}}</span></p>
            <p>{{item.content}}</p>
            <p><span class="time">{{item.pubdate | relTime}}</span></p>
          </div>
        </div>
      </van-list>
    </van-action-sheet>
  </div>
</template>

<script>
import { getComment, addComment, commentLikings } from '@/api/article'
export default {
  name: 'comment',
  data () {
    return {
      commentLoading: false, // 加载按钮显示隐藏
      value: '', // 评论  回复内容
      loading: false, // 加载效果
      finished: false, // 数据是否加载完成
      commentList: [
        {
          like_count: null // 评论点赞数量
        }
      ],
      offset: null, // 当前文章的偏移量
      // 回复页面
      showReply: false, // 回复弹出框的显示隐藏
      commentId: null, // 当前评论的id

      // 回复数据
      reply: {
        loading: false, // 加载效果
        finished: false, // 数据是否加载完成
        list: [], // 回复列表
        offset: null // 回复列表偏移量
      }
    }
  },
  activated () {
    // 清空评论列表
    this.commentList = []
    // 开启加载效果
    this.loading = true
    // 加载完成
    this.finished = false
    // 重置偏移量
    this.offset = null
    // 获取数据
    this.getComments()
  },
  methods: {
    // 对评论点赞
    async commentLikes (commentId) {
      await commentLikings(commentId)
      this.commentId = commentId
      let comment = this.commentList.find(item => item.com_id.toString() === this.commentId)
      this.commentList.like_count = comment.like_count
      // 让当前的回复数量+1
    },
    // 提交回复或者评论
    async submit () {
      if (!this.value) return false
      this.commentLoading = true // 开启加载效果
      // 判断提交内容类型
      if (this.showReply) {
        // 回复
        let data = await addComment(this.commentId, this.value, this.$route.params.id)
        this.$toast.success('回复成功')
        this.reply.list.unshift(data.new_obj)
        // 获取当前评论
        let comment = this.commentList.find(item => item.com_id.toString() === this.commentId)
        // 让当前的回复数量+1
        comment.reply_count++
      } else {
        let data = await addComment(this.$route.params.id, this.value)
        this.$toast.success('评论成功')
        this.commentList.unshift(data.new_obj)
      }
      // 关闭加载效果
      this.commentLoading = false // 开启加载效果
      this.value = '' // 清空内容
    },
    // 回复点击事件
    openReplyDialog (commentId) {
      this.showReply = true
      // 获取当前评论的id
      this.commentId = commentId
      // 重置回复列表数据
      this.reply.list = []
      this.reply.loading = true
      this.reply.finished = true
      this.reply.offset = null
      // 点击回复立即获取回复列表
      this.getReplys()
    },
    // 获取回复
    async getReplys () {
      let data = await getComment({
        type: 'c',
        source: this.commentId,
        offset: this.reply.offset
      })
      this.reply.list.push(...data.results)
      this.reply.loading = false
      // 判断是否还有数据
      if (data.last_id > data.end_id) {
        this.reply.offset = data.last_id
      } else {
        this.reply.finished = true
      }
    },
    // 获取评论
    async getComments () {
      let data = await getComment({
        type: 'a',
        source: this.$route.params.id,
        offset: this.offset
      })
      this.commentList.push(...data.results)
      // 结束加载效果
      this.loading = false
      // 判断是否还有数据：通过偏移量的id判断
      if (data.last_id > data.end_id) {
        // 有数据
        this.offset = data.last_id
      } else {
        // 无数据
        this.finished = true
      }
    }

  }
}
</script>

<style lang="less" scoped>
.comment {
  margin-top: 10px;
  /deep/ .item {
    display: flex;
    padding: 10px 0;
    .info {
      flex: 1;
      padding-left: 10px;
      .name{
        color:#069;
      }
      .zan{
        vertical-align:middle;
        padding-right:2px;
      }
      .count{
        vertical-align:middle;
        font-size:10px;
        color: #666;
      }
      .time{
        color: #666;
      }
      p {
        padding: 5px 0;
        margin: 0;
      }
    }
  }
  /deep/ .van-button:active::before {
    background: transparent;
  }
}
// 输入框样式
.reply-container {
  position: fixed;
  left: 0;
  bottom: 0;
  height: 44px;
  width: 100%;
  background: #f5f5f5;
  z-index: 9999;
  .submit {
    font-size: 12px;
    color: #3296fa;
  }
}

// 回复样式
.van-popup--bottom{
  &.van-popup--round{
    border-radius: 0;
  }
}
.reply_dailog {
  height: 100%;
  max-height: 100%;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  .van-action-sheet__header {
    background: #3296fa;
    color: #fff;
    .van-icon-close {
      color: #fff;
    }
  }
  .van-action-sheet__content{
    flex: 1;
    overflow-y: auto;
    padding: 0 10px 44px;
  }
}
</style>
