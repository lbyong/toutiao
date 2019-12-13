import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

// 导入路由模块
const Layout = () => import('@/views/Layout')
const Home = () => import('@/views/home/Index')
const Question = () => import('@/views/question/Index')
const Video = () => import('@/views/video/Index')
const User = () => import('@/views/user/Index')
const UserProfile = () => import('@/views/user/Profile')
const UserChat = () => import('@/views/user/Chat')
// const UserCamera = () => import('@/views/user/camera')
const Login = () => import('@/views/user/Login')
const Search = () => import('@/views/search/Index')
const SearchResult = () => import('@/views/search/Result')
const Article = () => import('@/views/home/Article')

Vue.use(VueRouter)

const routes = [
  // 配置路由规则
  {
    path: '/',
    component: Layout,
    children: [
      { path: '/', name: 'home', component: Home, meta: { isKeepAlive: true } },
      { path: '/question', name: 'question', component: Question },
      { path: '/video', name: 'video', component: Video },
      { path: '/user', name: 'user', component: User }
    ]
  },
  { path: '/user/profile', name: 'user-profile', component: UserProfile },
  // { path: '/user/camera', name: 'user-profile', component: UserCamera },
  { path: '/user/chat', name: 'user-chat', component: UserChat },
  { path: '/login', name: 'login', component: Login },
  { path: '/search', name: 'search', component: Search },
  { path: '/search/result', name: 'search-result', component: SearchResult },
  { path: '/article/:id', name: 'article', component: Article, meta: { isKeepAlive: true } }

]

const router = new VueRouter({
  routes
})

// 配置路由前置守卫进项登录拦截
router.beforeEach((to, from, next) => {
  // 如果未登录时访问以/user开头的是个人中心、编辑资料、小智同学页面进行登录配置
  const { user } = store.state // 拿到vuex中存储的token
  if (to.path.startsWith('/user') && !user.token) {
    return next({ path: '/login', query: { redirectUrl: to.path } })
  }
  next()
})

export default router
