
const Router = require('koa-router')
const router = new Router
const sql = require('../../../controller/sql/index')

/**
 * 返回友链列表
 */
router.get('/friendLink/list', async (ctx,next) => {
  let { pageSize, pageNo, name } = ctx.request.query
  try {
    const result = await sql.query(`select *, DATE_FORMAT(creatTime,\'%Y年%m月%d日%H时') as creatTime, 
            DATE_FORMAT(updateTime,\'%Y年%m月%d日%H时\') as updateTime from friendLink where name like "%${name}%" 
            limit ${(pageNo - 1) * pageSize}, ${pageSize * pageNo}`)
    const count = await sql.query(`select count(*) as count from friendLink where name like "%${name}%"`)
    ctx.body =  {
      state: 200,
      success: true,
      result: result,
      count: count[0].count
    }
  } catch (err) {
    throw err
  }
})

module.exports = router.routes()