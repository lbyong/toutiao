<template>
  <div class="container">
    <van-nav-bar fixed left-arrow @click-left="$router.back()" title="小智同学"></van-nav-bar>
    <div class="chat-list" ref="list">
      <div class="chat-item" :class="{left:item.name === 'xz',right:item.name === 'my'}" v-for="(item,i) in list" :key="i">
        <van-image v-if="item.name === 'xz'" fit="cover" round :src="xzPhoto" />
        <div class="chat-pao">{{item.msg}}</div>
        <van-image v-if="item.name === 'my'" fit="cover" round :src="photo" />
      </div>
    </div>
    <div class="reply-container van-hairline--top">
      <van-field v-model.trim="value" placeholder="说点什么...">
        <span @click="send()" slot="button" style="font-size:12px;color:#999">提交</span>
      </van-field>
    </div>
  </div>
</template>

<script>
import xzPhoto from '../../assets/xz.png' // 引入小智头像
import io from 'socket.io-client'
import { mapState } from 'vuex'
export default {
  name: 'user-chat',
  computed: {
    ...mapState(['photo', 'user'])
  },
  data () {
    return {
      value: '', // 发送的内容
      xzPhoto, // 小智头像
      list: [], // 聊天记录{name:'xz',msg:''}  {name:'my',msg:''}
      socket: null // 获取socket对象
    }
  },
  created () {
    // 在页面初始化时建立socket连接
    // 建立连接，需要传入token数据
    this.socket = io('http://ttapi.research.itcast.cn', {
      query: {
        token: this.user.token
      }
    })
    // 建立连接成功
    // socket.on('chat message', function(msg){}接受消息
    this.socket.on('connect', () => {
      // 建立连接后默认操作
      this.list.push({ name: 'xz', msg: '你好啊！' })
    })
    // 接收消息
    this.socket.on('message', (data) => {
      // 小智接受用户发送的消息并且回复
      this.list.push({ name: 'xz', msg: data.msg })
      this.scrollBtm() // 设置滚动
    })
  },
  beforeDestroy () {
    this.socket.close() // 实例销毁前关闭即时通讯服务
  },
  methods: {
    // 发送内容
    send () {
      // socket.emit('chat message', '内容') 发送消息
      // 传入输入的内容和当前时间戳
      this.socket.emit('message', { msg: this.value, timestamp: Date.now() })
      this.list.push({ name: 'my', msg: this.value })
      this.value = ''
      this.scrollBtm() // 设置滚动
    },
    // 滚动事件
    scrollBtm () {
      // 同时调用两次需要设置延时执行
      this.$nextTick(() => {
        // 获取list的scrollHeight未卷曲高度
        this.$refs.list.scrollTop = this.$refs.list.scrollHeight
      })
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  background:#fafafa;
  padding: 46px 0 50px 0;
  .chat-list {
    height: 100%;
    overflow-y: scroll;
    .chat-item{
      padding: 10px;
      .van-image{
        vertical-align: top;
        width: 40px;
        height: 40px;
      }
      .chat-pao{
        vertical-align: top;
        display: inline-block;
        min-width: 40px;
        max-width: 70%;
        min-height: 40px;
        line-height: 38px;
        border: 0.5px solid #c2d9ea;
        border-radius: 4px;
        position: relative;
        padding: 0 10px;
        background-color: #e0effb;
        word-break: break-all;
        font-size: 14px;
        color: #333;
        &::before{
          content: "";
          width: 10px;
          height: 10px;
          position: absolute;
          top: 12px;
          border-top:0.5px solid #c2d9ea;
          border-right:0.5px solid #c2d9ea;
          background: #e0effb;
        }
      }
    }
  }
}
.chat-item.right{
  text-align: right;
  .chat-pao{
    margin-left: 0;
    margin-right: 15px;
    &::before{
      right: -6px;
      transform: rotate(45deg);
    }
  }
}
.chat-item.left{
  text-align: left;
  .chat-pao{
    margin-left: 15px;
    margin-right: 0;
    &::before{
      left: -5px;
      transform: rotate(-135deg);
    }
  }
}
.reply-container {
  position: fixed;
  left: 0;
  bottom: 0;
  height: 44px;
  width: 100%;
  background: #f5f5f5;
  z-index: 9999;
}
</style>
