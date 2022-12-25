/**
 * 角色管理模块
 */
const router = require('koa-router')()
const Role = require('../models/roleSchema')
const util = require('./../utils/util')

router.prefix('/role')

// 查询所有角色列表
router.get('/alllist', async (ctx) => {
  try {
    const res = await Role.find({}, '_id roleName')
    ctx.body = util.success(res)
  } catch (error) {
    console.error(`${ctx.method} - ${ctx.url} - ${error}`)
    ctx.body = util.fail(error.message)
  }
})

// 按页获取角色列表
router.get('/list', async (ctx) => {
  try {
    // 获取查询参数
    const { roleName } = ctx.request.query
    // 获取分页参数
    const { page, skipIndex } = util.pager(ctx.request.query)
    // 查询条件
    const params = {}
    if (roleName) params.roleName = roleName
    // 根据条件查询所有用户列表
    const query = Role.find(params)
    const list = await query.skip(skipIndex).limit(page.pageSize)
    const total = await Role.countDocuments(params)
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

// 角色编辑、删除、新增功能
router.post('/operate', async (ctx) => {
  const { _id, roleName, remark, action } = ctx.request.body
  let info
  try {
    if (action === 'add') {
      await Role.create({ roleName, remark })
      info = '创建成功'
    } else if (action === 'edit') {
      const updateTime = Date.now()
      await Role.findByIdAndUpdate(_id, { roleName, remark, updateTime })
      info = '编辑成功'
    } else {
      await Role.findByIdAndRemove(_id)
      info = '删除成功'
    }
    ctx.body = util.success({}, info)
  } catch (error) {
    console.error(`${ctx.method} - ${ctx.url} - ${error}`)
    ctx.body = util.fail(error.message)
  }
})

// 权限设置
router.post('/permission', async (ctx) => {
  try {
    const { _id, permissionList } = ctx.request.body
    const updateTime = Date.now()
    await Role.findByIdAndUpdate(_id, { permissionList, updateTime })
    ctx.body = util.success({}, '权限设置成功')
  } catch (error) {
    console.error(`${ctx.method} - ${ctx.url} - ${error}`)
    ctx.body = util.fail(error.message)
  }
})

module.exports = router
