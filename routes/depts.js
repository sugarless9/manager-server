/**
 * 部门管理模块
 */
const router = require('koa-router')()
const Dept = require('../models/deptSchema')
const util = require('./../utils/util')

router.prefix('/dept')

// 部门列表查询
router.get('/list', async (ctx) => {
  try {
    let { deptName } = ctx.request.query
    // 查询条件
    let params = {}
    if (deptName) params.deptName = deptName
    let list = await Dept.find(params)
    if (deptName) {
      ctx.body = util.success(list)
    } else {
      const deptList = getTreeDept(list, null, [])
      ctx.body = util.success(deptList)
    }
  } catch (error) {
    console.error(`${ctx.method} - ${ctx.url} - ${error}`)
    ctx.body = util.fail(error.message)
  }
})

// 递归拼接树形列表
function getTreeDept(allList, id, list) {
  for (let i = 0; i < allList.length; i++) {
    let item = allList[i]
    if (String(item.parentId.slice().pop()) == String(id)) {
      list.push(item._doc)
    }
  }
  list.map((item) => {
    item.children = []
    getTreeDept(allList, item._id, item.children)
    if (item.children.length == 0) {
      delete item.children
    }
  })
  return list
}

// 部门编辑、删除、新增功能
router.post('/operate', async (ctx) => {
  const { _id, action, ...params } = ctx.request.body
  let info
  try {
    if (action === 'add') {
      await Dept.create(params)
      info = '创建成功'
    } else if (action === 'edit') {
      params.updateTime = Date.now()
      await Dept.findByIdAndUpdate(_id, params)
      info = '编辑成功'
    } else {
      await Dept.findByIdAndRemove(_id)
      await Dept.deleteMany({ parentId: { $all: [_id] } })
      info = '删除成功'
    }
    ctx.body = util.success({}, info)
  } catch (error) {
    console.error(`${ctx.method} - ${ctx.url} - ${error}`)
    ctx.body = util.fail(error.message)
  }
})

module.exports = router
