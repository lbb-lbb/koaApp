const Router = require('koa-router')
const router = new Router
const sql = require('../../controller/sql/index')

/**
 * 返回文章列表
 */
router.get('/articleList', async (ctx,next) => {
    const { pageSize, pageNo, title } = ctx.request.body

})


module.exports = router.routes()
