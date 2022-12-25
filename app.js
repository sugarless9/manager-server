const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const koajwt = require('koa-jwt')
const router = require('koa-router')()
const util = require('./utils/util')
const users = require('./routes/users')
const menus = require('./routes/menus')
const roles = require('./routes/roles')


// 错误处理
onerror(app)

// 连接数据库
require('./config/db')

// 中间件
app.use(
  bodyparser({
    enableTypes: ['json', 'form', 'text'],
  })
)
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(
  views(__dirname + '/views', {
    extension: 'pug',
  })
)

// logger
app.use(async (ctx, next) => {
  console.log(`get params:${JSON.stringify(ctx.request.query)}`)
  console.log(`post params:${JSON.stringify(ctx.request.body)}`)
  const start = new Date()
  await next().catch((err) => {
    if (err.status == '401') {
      ctx.status = 200
      ctx.body = util.fail('身份认证失败，请重新登录', util.CODE.AUTH_ERROR)
    } else {
      throw err
    }
  })
  console.log(`${ctx.method} ${ctx.url} - ${start}`)
})

// token校验
app.use(
  koajwt({ secret: 'tangsssss' }).unless({
    path: [/^\/api\/users\/login/],
  })
)

// 路由
router.prefix('/api')
router.use(users.routes(), users.allowedMethods())
router.use(menus.routes(), menus.allowedMethods())
router.use(roles.routes(), roles.allowedMethods())

app.use(router.routes(), router.allowedMethods())

// 错误处理
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
})

module.exports = app
