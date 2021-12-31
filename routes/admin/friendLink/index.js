const Router = require('koa-router')
const router = new Router
const sql = require('../../../controller/sql/index')
const util = require('../../../util/index')
// const { v4: uuidv4 } = require('uuid');

/**
 * 创建友链或者修改友链
 */
router.post('/friendLink/create', async (ctx, next) => {
  const { link, name, remark, id, head } = ctx.request.body
  const { id:userId} = ctx.state.user
  try {
    if(id) {
      let insert = util.filterUpdateValue({ link, name, remark, head })
      await sql.query(`update friendLink set ${insert.keys.map(key => `${key} = ?`).join(',')} where id like ? and userId like ?`, [...insert.values, id, userId])
      ctx.body = {
        message: '修改成功',
        success: true,
        state: 200
      }
    } else {
      await sql.query(`insert into friendLink(link, name, head, userId, remark) values(?,?,?,?,?)`,
        [link, name, head, userId, remark])
      ctx.body = {
        state: 200,
        success: true,
        message: '提交成功'
      }
    }
  } catch(err) {
    throw err
  }
})

/**
 * 删除友链
 */
router.post('/friendLink/delete', async (ctx, next) => {
  const { id } = ctx.request.body
  await sql.query('delete from friendLink where id = ?', [id])
  ctx.body = {
    message: "删除成功",
    success: true,
    state: 200
  }
})




module.exports = router.routes()