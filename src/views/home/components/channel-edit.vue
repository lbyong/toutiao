<template>
  <van-action-sheet
    :value="value"
    @closed="editing=false"
    @input="$emit('input', $event)"
    title="编辑频道"
  >
    <div class="channel">
      <div class="tit">
        我的频道：
        <span class="tip">点击可进入频道</span>
        <van-button v-if="!editing" @click="editing=true" size="mini" type="info" plain>编辑</van-button>
        <van-button v-else @click="editing=false" size="mini" type="danger" plain>完成</van-button>
      </div>
      <van-grid class="van-hairline--left">
        <!-- :class="{red:activeIndex === i  通过下标激活当前频道 -->
        <van-grid-item v-for="(item, i) in myChannels" :key="item.id">
          <span class="f12" @click="enterChannel(i)" :class="{red:activeIndex === i}">{{item.name}}</span>
          <van-icon @click="delChannel(i,item.id)" v-show="editing && i!==0" class="btn" name="cross"></van-icon>
        </van-grid-item>
      </van-grid>
    </div>
    <div class="channel">
      <div class="tit">可选频道：</div>
      <van-grid class="van-hairline--left">
        <van-grid-item v-for="item in optionalChannels" :key="item.id">
          <span class="f12">{{item.name}}</span>
          <van-icon @click="addChannel(item)" class="btn" name="plus"></van-icon>
        </van-grid-item>
      </van-grid>
    </div>
  </van-action-sheet>
</template>

<script>
import { getAllChannels, delChannel, addChannel } from '@/api/channel'
export default {
  name: 'channel-edit',
  data () {
    return {
      editing: false, // 控制编辑状态
      allChannels: [] // 获取全部频道
    }
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    // 频道列表
    myChannels: {
      type: Array,
      default: () => []
    },
    activeIndex: {
      type: Number,
      default: 0
    }
  },
  computed: {
    // 获取  可选频道=全部频道-我的频道
    optionalChannels () {
      return this.allChannels.filter(item => {
        // 返回false：查找到相同的id，排除不要
        // 返回true：查不到相同的id，追加到新数组中
        return this.myChannels.findIndex(myItem => myItem.id === item.id) === -1
      })
    }
  },
  created () {
    this.getAllChannel()
  },
  methods: {
    // 添加频道
    async addChannel (item) {
      // 在我的频道数据中添加seq默认序号数据(后台要求传递的数据)
      const orderChannels = this.myChannels.map((item, i) => {
        return {
          id: item.id, // 默认id
          name: item.name, // 默认name
          seq: i // 默认排序（不包含推荐，从1开始排序）
        }
      })
      // 把当前点击的频道追加到我的频道中
      orderChannels.push({ ...item, seq: orderChannels.length })
      orderChannels.shift() // 删除默认的推荐频道
      try {
        // 调用接口添加
        await addChannel(orderChannels)
        this.$toast.success('添加成功')
        // 给频道列表添加对应的频道数据，并渲染给我的频道
        this.myChannels.push({
          id: item.id, // 频道id
          name: item.name, // 频道名称
          articles: [], // 频道对应文章列表
          upLoading: false, // 上滑加载
          downLoading: false, // 下拉刷新效果
          finished: false, // 继续数据加载
          timestamp: Date.now(), // 当前时间戳
          scrollTop: 0 // 阅读滚动位置
        })
      } catch (err) {
        this.$toast.fail('添加失败')
      }
    },
    // 删除频道
    async delChannel (index, channelsId) {
      await delChannel(channelsId)
      // this.$emit('input', false) // 关闭对话框
      this.$toast.success('删除成功')
      // 检测激活频道索引大于当前删除的索引
      if (index < this.activeIndex) {
        // 让当前索引-1
        this.$emit('update:activeIndex', this.activeIndex - 1)
      }
      // 让父元素的频道列表对应的频道删除
      this.myChannels.splice(index, 1)
    },
    // 我的频道点击事件
    // 传入当前频道索引i，父元素通过当前激活频道索引接受 i 的索引值
    enterChannel (index) {
      this.$emit('input', false) // 关闭对话框
      // 父组件通过.sync控制，子组件需要绑定修改数据 :activeIndex
      this.$emit('update:activeIndex', index)
    },
    // 获取全部频道
    async getAllChannel () {
      let data = await getAllChannels()
      this.allChannels = data.channels
    }
  }
}
</script>

<style lang="less" scoped>
.van-popup--bottom{
  &.van-popup--round{
    border-radius: 0;
  }
}
.van-action-sheet {
  max-height: 100%;
  height: 100%;
  .van-action-sheet__header {
    background: #3296fa;
    color: #fff;
    .van-icon-close {
      color: #fff;
    }
  }
}
.channel {
  padding: 10px;
  .tit{
    line-height: 3;
    .tip {
      font-size: 10px;
      color: #999;
    }
  }
  .van-button {
    float: right;
    margin-top: 7px;
  }
  .btn{
    position: absolute;
    bottom: 0;
    right: 0;
    background: #ddd;
    font-size: 12px;
    color: #fff;
  }
  .f12{
      font-size:12px;
      color: #555;
  }
  .red{
    color: red;
  }
}
</style>
