const Router = require('koa-router')
const router = new Router
const sql = require('../../../controller/sql/index')

router.get('/userMessage', async (ctx, next) => {
  try {
    let result = await sql.query('select * from user')
    delete result[0].password
    ctx.body = {
      state: 200,
      success: true,
      result: result[0]
    }
  } catch(err) {
    ctx.throw(err)
  }
})

module.exports = router.routes()