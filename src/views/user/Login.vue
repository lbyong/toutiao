<template>
  <div class="page-user-chat">
    <van-nav-bar left-arrow @click-left="$router.back()" title="登录"></van-nav-bar>
    <van-cell-group>
      <van-field @blur="validMobile" v-model.trim="loginForm.mobile" :error-message="errorMsg.mobile" label="手机号" placeholder="请输入手机号" />
      <van-field @blur="validCode" v-model.trim="loginForm.code" :error-message="errorMsg.code" label="验证码" placeholder="请输入验证码">
        <van-button class="p5" slot="button" size="mini" type="primary">发送验证码</van-button>
      </van-field>
    </van-cell-group>
    <div class="btn_box">
      <van-button type="info" @click="login()" block round>登 录</van-button>
    </div>
  </div>
</template>

<script>
// 引入接口
import { login } from '@/api/user'
import { mapMutations } from 'vuex'
export default {
  name: 'login',
  data () {
    return {
      // 表单验证
      loginForm: {
        mobile: '13911111111', // 手机号
        code: '246810' // 验证码
      },
      errorMsg: {
        mobile: '', // 手机号
        code: '' // 验证码
      }
    }
  },
  methods: {
    // 手机号校验
    validMobile () {
      let value = this.loginForm.mobile // 获取手机号
      if (!value) {
        this.errorMsg.mobile = '请输入手机号码'
      } else if (!/^1[35789]\d{9}$/.test(value)) {
        this.errorMsg.mobile = '手机号码格式不正确'
      } else {
        this.errorMsg.mobile = ''
      }
    },
    // 校验验证码
    validCode () {
      let value = this.loginForm.code // 获取手机号
      if (!value) {
        this.errorMsg.code = '请输入验证码'
      } else if (!/^\d{6}$/.test(value)) {
        this.errorMsg.code = '验证码错误'
      } else {
        this.errorMsg.code = ''
      }
    },
    ...mapMutations(['setUser']), // 获取vuex中的setUser方法
    async login () {
      this.validMobile()
      this.validCode()
      if (!this.errorMsg.mobile && !this.errorMsg.code) {
        try {
          let data = await login(this.loginForm)
          // data包含vuex中的token和refresh_token
          this.setUser(data) // 重新设置vuex和本地的token
          this.$router.push(this.$route.query.redirectUrl || '/user')
          this.$toast.success('登录成功')
        } catch (err) {
          this.$toast.fail('登录失败')
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.p5{
  padding: 0 10px;
}
.btn_box{
  padding: 20px 10px;
  .van-button{
    height: 40px;
    line-height: 40px;
  }
}
</style>
