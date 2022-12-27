const mongoose = require('mongoose')
const deptSchema = mongoose.Schema({
  deptName: String, //部门名称
  userId: String, 
  userName: String, 
  userEmail: String, 
  parentId: [mongoose.Types.ObjectId],
  createTime: {
    type: Date,
    default: Date.now(),
  }, //创建时间
  updateTime: {
    type: Date,
    default: Date.now(),
  }, //更新时间
})

module.exports = mongoose.model('dept', deptSchema, 'depts')
