/**
 * 通用工具函数
 */
const CODE = {
  SUCCESS: 200,
  PARAM_ERROR: 10001, // 参数错误
  USER_ACCOUNT_ERROR: 20001, // 账号或密码错误
  USER_LOGIN_ERROR: 30001, // 用户未登录
  BUSINESS_ERROR: 40001, // 业务请求失败
  AUTH_ERROR: 50001, // 认证失败或TOKEN过期
}
module.exports = {
  /**
   * 分页结构封装
   * @param {number} pageNum
   * @param {number} pageSize
   */
  pager({ pageNum = 1, pageSize = 10 }) {
    pageNum *= 1
    pageSize *= 1
    const skipIndex = (pageNum - 1) * pageSize
    return {
      page: {
        pageNum,
        pageSize,
      },
      skipIndex,
    }
  },

  /**
   * 成功返回结构封装
   * @param {*} data 返回数据
   * @param {*} code 返回状态码
   * @param {*} msg 返回提示信息
   * @returns
   */
  success(data = '', msg = '', code = CODE.SUCCESS) {
    return {
      code,
      data,
      msg,
    }
  },

  /**
   * 失败返回结构封装
   * @param {*} msg 返回提示信息
   * @param {*} code 返回状态码
   * @param {*} data 返回数据
   * @returns
   */
  fail(msg = '', code = CODE.BUSINESS_ERROR, data = '') {
    return {
      data,
      code,
      msg,
    }
  },
  CODE,
}
