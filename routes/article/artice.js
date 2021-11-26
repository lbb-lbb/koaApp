const Router = require('koa-router')
const router = new Router
const sql = require('../../controller/sql/index')
const util = require('../../util/index')


/**
 * 返回文章列表
 */
router.get('/articleList', async (ctx,next) => {
    let { pageSize, pageNo, title } = ctx.request.query
    pageSize = pageSize || 100000
    pageNo = pageNo || 1
    title = title || ''
    try {
        const result = await sql.query(`select title, id, abstract, tag, category, likeCount, readCount,
            commentCount, userName, DATE_FORMAT(creatTime,\'%Y年%m月%d日%H时') as creatTime, 
            DATE_FORMAT(updateTime,\'%Y年%m月%d日%H时\') as updateTime from article where title like "%${title}%" limit ${(pageNo - 1) * pageSize}, ${pageSize * pageNo}`)
        ctx.body =  {
            state: 200,
            success: true,
            result: result,
            total: result.length
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
        const result = await sql.query(`select *, DATE_FORMAT(creatTime,\'%Y年%m月%d日%H时%i分\') as creatTime
                from article where id = ?`, [id])
        ctx.body =  {
            state: 200,
            success: true,
            result: result[0]
        }
    } catch (err) {
        throw err
    }
})

/**
 *点赞、阅读量、喜欢数量自增
 */
router.post('/count', async (ctx, next) => {
    const { likeCount, readCount, commentCount, id } = ctx.request.body
    try {
        let insert = util.filterUpdateValue({ likeCount, readCount, commentCount })
        console.log(`update article set ${insert.keys.map(v => `${v}= ${v}+1`)} where id like ?`)
        await sql.query(`update article set ${insert.keys.map(v => `${v}= ${v}+1`)} where id like ?`, [id])
        ctx.body = {
            state: 200,
            success: true,
            message: "提交成功"
        }
    } catch (err) {
        throw err
    }

})

module.exports = router.routes()
