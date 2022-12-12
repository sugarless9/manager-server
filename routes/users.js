/**
 * 用户管理模块
 */
const router = require('koa-router')()
const User = require('./../models/userSchema')
const util = require('./../utils/util')
const jwt = require('jsonwebtoken')

router.prefix('/users')

// test
router.get('/', (ctx) => {
  ctx.body = 'tangsssss'
})

/**
 * 返回数据库指定字段，有三种方式
 * 1. 'userId userName userEmail state role deptId roleList' =>第二个参数
 * 2. {userId:1,_id:0} =>第二个参数
 * 3. select('userId') => .select()
 */

// 登录
router.post('/login', async (ctx) => {
  try {
    // 获取参数
    const { userName, userPwd } = ctx.request.body
    // 查询数据库
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
      return
    }
    ctx.body = util.fail('账号或密码不正确', util.CODE.USER_ACCOUNT_ERROR)
  } catch (error) {
    console.error(`${ctx.method} - ${ctx.url} - ${error}`)
    ctx.body = util.fail(error.message)
  }
})

// 用户列表
router.get('/list', async (ctx) => {
  try {
    // 获取查询参数
    const { userId, userName, state } = ctx.request.query
    // 获取分页参数
    const { page, skipIndex } = util.pager(ctx.request.query)
    // 查询条件
    const params = {}
    if (userId) params.userId = userId
    if (userName) params.userName = userName
    if (state && state !== '0') params.state = state
    // 根据条件查询所有用户列表
    const res = User.find(params, { _id: 0, userPwd: 0 })
    const list = await res.skip(skipIndex).limit(page.pageSize)
    const total = await User.countDocuments(params)
    ctx.body = util.success({
      page: {
        ...page,
        total,
      },
      list,
    })
  } catch (error) {
    console.error(`${ctx.method} - ${ctx.url} - ${error}`)
    ctx.body = util.fail(error.message)
  }
})

// 用户删除/批量删除
router.post('/delete', async (ctx) => {
  try {
    // 待删除的用户Id数组
    const { userIds } = ctx.request.body
    console.log(userIds)
    // 软删除（把用户状态更改为离职）
    const res = await User.updateMany({ userId: { $in: userIds } }, { state: 2 })
    console.log(res)
    if (res.modifiedCount) {
      ctx.body = util.success(res, '', `共删除成功${res.modifiedCount}条`)
      return
    }
    ctx.body = util.fail('删除失败')
  } catch (error) {
    console.error(`${ctx.method} - ${ctx.url} - ${error}`)
    ctx.body = util.fail(error.message)
  }
})

module.exports = router
