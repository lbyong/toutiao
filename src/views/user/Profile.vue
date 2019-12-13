<template>
     <div class="container">
    <van-nav-bar left-arrow @click-right="save" @click-left="$router.back()" title="编辑资料" right-text="保存" ></van-nav-bar>
    <van-cell-group>
      <van-cell is-link title="头像" @click="showPhoto=true" center>
        <van-image
          slot="default"
          width="1.5rem"
          height="1.5rem"
          fit="cover"
          round
          :src="photo"
        />
      </van-cell>
      <van-cell is-link title="名称" @click="showName=true" :value="user.name" />
      <van-cell is-link title="性别" @click="showGender=true" :value="user.gender===0?'男':'女'" />
      <van-cell is-link title="生日" @click="openDate()" :value="user.birthday" />
    </van-cell-group>
    <van-popup v-model="showPhoto" position="bottom">
     <!-- <label for="photosle"> -->
        <van-cell @click="$refs.fileInput.click()" value="本地相册选择" is-link/>
        <van-cell @click="photograph()" value="拍照" is-link/>
     <!-- </label> -->
    </van-popup>
    <van-popup v-model="showName" position="bottom">
      <van-field v-model="user.name" required placeholder="请输入用户名" />
    </van-popup>
    <van-popup v-model="showGender" position="bottom">
      <van-cell value="男" @click="changeGender(0)" is-link/>
      <van-cell value="女" @click="changeGender(1)" is-link/>
    </van-popup>
    <van-popup v-model="showBirthday" position="bottom">
      <van-datetime-picker
        title="选择生日"
        v-model="nowDate"
        type="date"
        :min-date="minDate"
        :max-date="maxDate"
        @cancel="showBirthday=false"
        @confirm="confirmDate"
      />
    </van-popup>
    <van-popup position="bottom" :style="{ height: '100%' }" v-model="showCamera">
      <div class="centent">
      <input type="button" title="开启摄像头" value="开启摄像头" @click="getMedia()" />
      <input type="button" title="关闭摄像头" value="关闭摄像头" @click="stopMedia()" />
      <video ref="video" id="video" autoplay="autoplay"></video>
      <canvas style="display:none" ref="canvas" id="canvas" width="100px" height="100px"></canvas>
      <button id="snap" @click="takePhoto()"></button>
  </div>
    </van-popup>
    <input @change="preview" style="display:none" ref="fileInput" type="file" id="photosle">
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { getUser, editUserInfo, editPhoto } from '@/api/user'
export default {
  name: 'user-profile',
  data () {
    return {
      MediaStream: null,
      imgUrl: '',
      showCamera: false, // 显示拍照
      showPhoto: false, // 选择照片对话框
      showGender: false, // 选择性别对话框
      showBirthday: false, // 选择生日对话框
      showName: false, // 姓名显示隐藏
      photo: '',
      minDate: new Date('1970-01-01'), // 生日最小时间
      maxDate: new Date(), // 生日最大时间
      nowDate: new Date(), // 当前时间
      user: {
        name: '', // 用户名
        gender: 1, // 性别，0男  1女
        birthday: '' // 生日
      }
    }
  },
  created () {
    this.getUserPor() // 获取个人资料
  },
  beforeDestroy () {
    this.getMedia()
  },
  methods: {
    // // 拍照
    // captureImage () {
    //   var cmr = plus.camera.getCamera()
    //   var res = cmr.supportedImageResolutions[0]
    //   var fmt = cmr.supportedImageFormats[0]
    //   console.log('Resolution: ' + res + ', Format: ' + fmt)
    //   cmr.captureImage(function (path) {
    //     alert('Capture image success: ' + path)
    //   },
    //   function (error) {
    //     alert('Capture image failed: ' + error.message)
    //   },
    //   { resolution: res, format: fmt }
    //   )
    // },
    // 点击拍照
    photograph () {
      this.showCamera = true
      this.getMedia()
    },
    // 开启摄像头
    getMedia () {
      let constraints = {
        video: { width: 1000, height: 1000 },
        audio: true
      }
      let promise = navigator.mediaDevices.getUserMedia(constraints)
      promise.then((MediaStream) => {
        this.MediaStream = MediaStream
        this.$refs.video.srcObject = MediaStream
        this.$refs.video.play()
      }).catch((PermissionDeniedError) => {
        console.log(PermissionDeniedError)
      })
    },
    // 点击拍照
    takePhoto () {
      // 获得Canvas对象
      // let canvas = document.getElementById('canvas')
      let ctx = this.$refs.canvas.getContext('2d')
      ctx.drawImage(this.$refs.video, 0, 0, 500, 500)
      this.photo = this.$refs.canvas.toDataURL() // 获取编码图片信息
      this.showCamera = false
      this.showPhoto = false
      // 关闭摄像头
      this.MediaStream.getTracks()[1].stop()
    },
    // 选择预览头像
    preview () {
      // let data = await editPhoto()
      // 获取当前的文件对象
      let file = this.$refs.fileInput.files[0]
      // 通过new FileReader()可以获取到选择的文件对象 base64 信息
      let fileReader = new FileReader()
      fileReader.readAsDataURL(file)
      fileReader.onload = () => {
        this.photo = fileReader.result // 获取选择文件base64信息
        // console.log(fileReader.result)
        this.showPhoto = false // 关闭对话框
      }
    },
    // 获取用户个人资料
    async getUserPor () {
      let data = await getUser()
      this.user = data
      // 获取图片的信息
      this.photo = data.photo
    },
    // 选择生日确认,组件提供的默认事件，value为当前对话框的时间
    confirmDate (value) {
      // 获取时间对话框中的时间信息
      // dayjs将当前选择的时间进行格式转换
      this.user.birthday = dayjs(value).format('YYYY-MM-DD')
      // 关闭时间对话框
      this.showBirthday = false
    },
    // 保存成功
    async save () {
      try {
        await editPhoto(this.$refs.fileInput.files[0]) // 修改头像
        await editUserInfo(this.user) // 修改用户信息
        // 点击保存提交用户头像和用户个人信息
        this.$toast.success('保存成功')
        this.$router.push('/user')
      } catch (e) {
        this.$toast.fail('保存失败')
      }
    },
    // 显示生日选择框
    openDate () {
      // 判断是否有生日数据
      if (this.user.birthday) {
        // 在对话框显示默认的时间
        this.nowDate = new Date(this.user.birthday)
      }
      this.showBirthday = true
    },
    // 选择性别
    changeGender (gender) {
      // 获取对应的性别
      this.user.gender = gender
      // 关闭对话框
      this.showGender = false
    }
  }
}
</script>

<style lang="less" scoped>
.centent {
  width: 100%;
  height: 100%;
  position: relative;
  input{
    display: none
  }
  video {
    display: block;
    position: absolute;
    // width: 750px;
    margin: 0 auto;
    height: 1334px;
    overflow: hidden;
    // height: 100%;
    transform: translate(-50%,-50%)
  }
  #snap {
    outline: none;
    border: 4px solid #fff;
    background-color:rgba(255, 255, 255, 0.1);
    // font-size: 24px;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    z-index: 999;
    position: absolute;
    bottom: 60px;
    // top: 0;
    left: 50%;
    transform: translate(-50%,0)
    // right: 0;
    // margin:auto;
  }
}
</style>
