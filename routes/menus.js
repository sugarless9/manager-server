/**
 * 菜单管理模块
 */
const router = require('koa-router')()
const Menu = require('../models/menuSchema')
const util = require('./../utils/util')

router.prefix('/menus')

// 菜单列表查询
router.get('/list', async (ctx) => {
  try {
    const { menuName, menuState } = ctx.request.query
    const params = {}
    if (menuName) params.menuName = menuName
    if (menuState) params.menuState = menuState
    let rootList = (await Menu.find(params)) || []
    const permissionList = getTreeMenu(rootList, null, [])
    ctx.body = util.success(permissionList)
  } catch (error) {
    console.error(`${ctx.method} - ${ctx.url} - ${error}`)
    ctx.body = util.fail(error.message)
  }
})

// 递归拼接树形列表
function getTreeMenu(rootList, id, list) {
  for (let i = 0; i < rootList.length; i++) {
    let item = rootList[i]
    if (String(item.parentId.slice().pop()) == String(id)) {
      list.push(item._doc)
    }
  }
  list.map((item) => {
    item.children = []
    getTreeMenu(rootList, item._id, item.children)
    if (item.children.length == 0) {
      delete item.children
    } else if (item.children.length > 0 && item.children[0].menuType == 2) {
      // 快速区分按钮和菜单，用于后期做菜单按钮权限控制
      item.action = item.children
    }
  })
  return list
}

// 菜单编辑、删除、新增功能
router.post('/operate', async (ctx) => {
  const { _id, action, ...params } = ctx.request.body
  let info
  try {
    if (action === 'add') {
      await Menu.create(params)
      info = '创建成功'
    } else if (action === 'edit') {
      params.updateTime = Date.now()
      await Menu.findByIdAndUpdate(_id, params)
      info = '编辑成功'
    } else {
      await Menu.findByIdAndRemove(_id)
      await Menu.deleteMany({ parentId: { $all: [_id] } })
      info = '删除成功'
    }
    ctx.body = util.success({}, info)
  } catch (error) {
    console.error(`${ctx.method} - ${ctx.url} - ${error}`)
    ctx.body = util.fail(error.message)
  }
})

module.exports = router
