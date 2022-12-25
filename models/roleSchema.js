const mongoose = require('mongoose')
const roleSchema = mongoose.Schema({
  roleName: String, //角色名称
  remark: String, // 备注
  permissionList: {
    checkedKeys: [],
    halfCheckedKeys: [],
  },
  createTime: {
    type: Date,
    default: Date.now(),
  }, //创建时间
  updateTime: {
    type: Date,
    default: Date.now(),
  }, //更新时间
})

module.exports = mongoose.model('role', roleSchema, 'roles')
