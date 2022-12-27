/**
 * 用户管理模块
 */
const router = require('koa-router')()
const User = require('./../models/userSchema')
const Counter = require('./../models/counterSchema')
const util = require('./../utils/util')
const jwt = require('jsonwebtoken')

router.prefix('/users')

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
    if (!res) {
      ctx.body = util.fail('账号或密码不正确', util.CODE.USER_ACCOUNT_ERROR)
      return
    }
    // 更新最后登陆时间
    await User.updateMany({ userId: { $in: [res.userId] } }, { lastLoginTime: Date.now() })
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
  } catch (error) {
    console.error(`${ctx.method} - ${ctx.url} - ${error}`)
    ctx.body = util.fail(error.message)
  }
})

// 查询所有用户列表
router.get('/all/list', async (ctx) => {
  try {
    const res = await User.find({}, 'userId userName userEmail')
    ctx.body = util.success(res)
  } catch (error) {
    console.error(`${ctx.method} - ${ctx.url} - ${error}`)
    ctx.body = util.fail(error.message)
  }
})

// 按页获取用户列表
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
    // 软删除（把用户状态更改为离职）
    const res = await User.updateMany({ userId: { $in: userIds } }, { state: 2 })
    if (res.modifiedCount) {
      ctx.body = util.success(res, `成功删除${res.modifiedCount}条`)
      return
    }
    ctx.body = util.fail('删除失败')
  } catch (error) {
    console.error(`${ctx.method} - ${ctx.url} - ${error}`)
    ctx.body = util.fail(error.message)
  }
})

// 用户新增/编辑
router.post('/operate', async (ctx) => {
  try {
    // 成功返回提示信息
    let info
    // 获取参数
    const { userId, userName, userEmail, mobile, job, state, sex, roleList, deptId, action } = ctx.request.body
    if (action === 'add') {
      // 用户新增
      console.log(!userEmail)
      if (!userName || !userEmail || !deptId) {
        ctx.body = util.fail('参数错误', util.CODE.PARAM_ERROR)
        return
      }
      // 查询名称或邮箱是否已存在
      const res = await User.findOne({ $or: [{ userName }, { userEmail }] }, '_id userName userEmail')
      if (res) {
        ctx.body = util.fail(`系统监测到有重复的用户，信息如下：${res.userName} - ${res.userEmail}`)
        return
      }
      // 用户ID自增长
      const doc = await Counter.findOneAndUpdate({ _id: 'userId' }, { $inc: { sequence_value: 1 } }, { new: true })
      // 创建新用户
      const user = new User({
        userId: doc.sequence_value,
        userName,
        userPwd: '123456',
        userEmail,
        role: 1, //默认普通用户
        roleList,
        job,
        state,
        deptId,
        mobile,
        sex,
      })
      user.save()
      info = '用户创建成功'
    } else if (action === 'edit') {
      // 用户编辑
      if (!deptId) {
        ctx.body = util.fail('部门不能为空', util.CODE.PARAM_ERROR)
        return
      }
      // 根据userId查询并更新
      await User.findOneAndUpdate({ userId }, { mobile, job, state, roleList, deptId, sex })
      info = '更新成功'
    } else {
      ctx.body = util.fail('action参数错误', util.CODE.PARAM_ERROR)
      return
    }
    ctx.body = util.success({}, info)
  } catch (error) {
    console.error(`${ctx.method} - ${ctx.url} - ${error}`)
    ctx.body = util.fail(error.message)
  }
})

module.exports = router
