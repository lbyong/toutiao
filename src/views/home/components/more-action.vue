<template>
  <van-popup :value="value" @input="$emit('input', $event)" @open="isReport=false">
    <van-cell-group v-if="!isReport">
      <van-cell @click="disLike()">不感兴趣</van-cell>
      <van-cell is-link @click="isReport=true">反馈垃圾内容</van-cell>
      <van-cell>拉黑作者</van-cell>
    </van-cell-group>
    <van-cell-group v-else>
      <van-cell icon="arrow-left" @click="isReport=false">返回</van-cell>
      <van-cell @click="report(item.value)" v-for="item in reportsList" :key="item.value">{{item.label}}</van-cell>
    </van-cell-group>
  </van-popup>
</template>

<script>
import { disLikes, report } from '@/api/article'
import { reports } from '@/api/constants'
export default {
  name: 'more-action',
  data () {
    return {
      show: false, // 更多操作弹窗的显示隐藏
      isReport: false, // 返回的切换
      reportsList: reports // 举报类型
    }
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    articleId: {
      type: String,
      default: null
    }
  },
  methods: {
    // 举报文章
    async report (type) {
      try {
        await report(this.articleId, type)
        this.$toast.success('举报成功')
        this.$emit('input', false) // 关闭对话框
        this.$emit('report')
      } catch (err) {
        if (err.response.status === 409) {
          return this.$toast.fail('已举报该文章')
        }
        this.$toast.fail('举报失败')
      }
    },
    // 对文章不感兴趣
    async disLike () {
      try {
        await disLikes(this.articleId)
        this.$toast.success('操作成功')
        this.$emit('input', false) // 关闭对话框
        this.$emit('del')
      } catch (err) {
        this.$toast.success('操作失败')
      }
    }
  }
}
</script>

<style lang="less" scoped>
.van-popup {
  width: 80%;
  border-radius: 4px;
}
</style>
