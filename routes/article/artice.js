const Router = require('koa-router')
const router = new Router
const sql = require('../../controller/sql/index')

/**
 * 返回文章列表
 */
router.get('/articleList', async (ctx,next) => {
    const { pageSize, pageNo, title } = ctx.request.query
    try {
        const result = await sql.query('select title, id, abstract, tag, category, likeCount, readCount, commentCount from article ' +
            `where title like "%${title}%" limit ${(pageNo - 1) * pageSize}, ${pageSize}`)
        ctx.body =  {
            state: 200,
            success: true,
            result: result
        }
    } catch (err) {
        throw err
    }
})

/**
 * 文章详情
 */
router.get('/articleInfo', async (ctx, next) => {
    const { id } = ctx.request.query
    try {
        const result = await sql.query('select * from article where id = ?', [id])
        ctx.body =  {
            state: 200,
            success: true,
            result: result
        }
    } catch (err) {
        throw err
    }
})

module.exports = router.routes()
