/**
 * 用户管理模块
 */
const router = require('koa-router')()
const User = require('./../models/userSchema')
const util = require('./../utils/util')
const jwt = require('jsonwebtoken')

router.prefix('/users')

router.get('/', (ctx) => {
  ctx.body = 'sssss'
})

// 登录
router.post('/login', async (ctx) => {
  try {
    const { userName, userPwd } = ctx.request.body
    /**
     * 返回数据库指定字段，有三种方式
     * 1. 'userId userName userEmail state role deptId roleList' =>第二个参数
     * 2. {userId:1,_id:0} =>第二个参数
     * 3. select('userId') => .select()
     */
    let res = await User.findOne(
      {
        userName,
        userPwd,
      },
      'userId userName userEmail state role deptId roleList'
    )
    if (res) {
      const data = res._doc
      // 生成token
      const token = jwt.sign(
        {
          data,
        },
        'tangsssss',
        { expiresIn: '1h' }
      )
      data.token = token
      ctx.body = util.success(data)
    } else {
      ctx.body = util.fail('账号或密码不正确')
    }
  } catch (error) {
    console.error(error)
    ctx.body = util.fail(error.msg)
  }
})

module.exports = router
