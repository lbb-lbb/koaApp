const Router = require('koa-router')
const router = new Router
const sql = require('../../../controller/sql/index')
const util = require('../../../util/index')
// const { v4: uuidv4 } = require('uuid');

/**
 * 创建项目或者修改项目
 */
router.post('/project/create', async (ctx, next) => {
  const { link, name, remark, head, id } = ctx.request.body
  const { id:userId} = ctx.state.user
  try {
    if(id) {
      let insert = util.filterUpdateValue({ link, name, remark, head })
      await sql.query(`update project set ${insert.keys.map(key => `${key} = ?`).join(',')} where id like ? and userId like ?`, [...insert.values, id, userId])
      ctx.body = {
        message: '修改成功',
        success: true,
        state: 200
      }
    } else {
      await sql.query(`insert into project(link, name, userId, remark, head) values(?,?,?,?,?)`,
        [link, name, userId, remark, head])
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
 * 删除项目
 */
router.post('/project/delete', async (ctx, next) => {
  const { id } = ctx.request.body
  await sql.query('delete from project where id = ?', [id])
  ctx.body = {
    message: "删除成功",
    success: true,
    state: 200
  }
})




module.exports = router.routes()