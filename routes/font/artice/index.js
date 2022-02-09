const Router = require('koa-router')
const router = new Router
const sql = require('../../../controller/sql/index')
const util = require('../../../util/index')


/**
 * 返回font文章列表
 */
router.get('/articleList', async (ctx,next) => {
    let { pageSize, pageNo, title, tag, category } = ctx.request.query
    pageSize = pageSize || 100000
    pageNo = pageNo || 1
    title = title || ''
    tag = tag && tag.replace(/,/g,"|") || ''
    category = category || ''
    try {
        const result = await sql.query(`select article.*, DATE_FORMAT(article.creatTime,\'%Y年%m月%d日%H时') as creatTime, 
            user.name as userName,
            DATE_FORMAT(article.updateTime,\'%Y年%m月%d日%H时\') as updateTime from article left join user
             on article.userId = user.id where article.title like "%${title}%" and article.tag regexp "${tag || '.'}" and article.category like "%${category}%" 
            and article.status=2 order by creatTime desc limit ${(pageNo - 1) * pageSize}, ${pageSize * pageNo}`)
        const count = await sql.query(`select count(article.id) as count from article left join user
             on article.userId = user.id where article.title like "%${title}%" and article.tag regexp "${tag || '.'}" and article.category like "%${category}%" 
            and article.status=2`)
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

/**
 * 文章详情
 */
router.get('/articleInfo', async (ctx, next) => {
    const { id } = ctx.request.query
    try {
        const result = await sql.query(`select article.*, DATE_FORMAT(article.creatTime,\'%Y年%m月%d日%H时') as creatTime,
                user.head, user.name as userName, user.introduction
                from article inner join user ON article.userId=user.id where article.id = ?`, [id])
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

/**
 * 返回文章的分类,标签
 */
router.get('/article/classifyList', async (ctx, next) => {
    try {
        let result = await sql.query(`select tag, category from article`)
        let tags = [...new Set(result.map(v => v.tag).join(',').replace(/，/ig,',').split(','))]
        let category = [...new Set(result.map(v => v.category).join(',').split(','))]
        ctx.body = {
            state: 200,
            success: true,
            result: { tags, category }
        }
    } catch (err) {
        throw err
    }
})

module.exports = router.routes()