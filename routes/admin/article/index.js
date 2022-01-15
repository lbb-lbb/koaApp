const Router = require('koa-router')
const router = new Router
const sql = require('../../../controller/sql/index')
const util = require('../../../util/index')
const { v4: uuidv4 } = require('uuid');

/**
 * 创建文章或者修改文章
 */
router.post('/article/create', async (ctx, next) => {
    const { title, abstract, tag, category, status, content, id } = ctx.request.body
    const { id:userId} = ctx.state.user
    try {
        if(id) {
            let insert = util.filterUpdateValue({ title, abstract, tag, category, status, content })
            await sql.query(`update article set ${insert.keys.map(key => `${key} = ?`).join(',')} where id like ? and userId like ?`, [...insert.values, id, ctx.state.user.id])
            ctx.body = {
                message: '修改成功',
                success: true,
                state: 200
            }
        } else {
            const uuid = uuidv4()
            await sql.query('insert into article(id, title, abstract, tag, category, status, userId, content) values(?, ?, ?, ?, ? ,?, ?, ?)',
                [uuid, title, abstract, tag, category, status, userId, content])
            ctx.body = {
                state: 200,
                success: true,
                message: '提交成功',
                id: uuid
            }
        }
    } catch(err) {
        throw err
    }
})

/**
 * 删除文章
 */
router.post('/article/delete', async (ctx, next) => {
    const { id } = ctx.request.body
    await sql.query('delete from article where id = ?', [id])
    ctx.body = {
        message: "删除成功",
        success: true,
        state: 200
    }
})

/**
 * 返回文章列表
 */
router.get('/article/list', async (ctx,next) => {
    let { pageSize, pageNo, title, status, tag, category } = ctx.request.query
    const { id } = ctx.state.user
    status = status || 2
    tag = tag || ''
    category = category || ''
    try {
        const result = await sql.query(`select article.*, DATE_FORMAT(article.creatTime,\'%Y年%m月%d日%H时') as creatTime, 
            user.name as userName,
            DATE_FORMAT(article.updateTime,\'%Y年%m月%d日%H时\') as updateTime from article left join user
             on article.userId = user.id where article.title like "%${title}%" and userId = '${id}'
             and article.tag regexp "${tag || '.'}" and article.category like "%${category}%" limit ${(pageNo - 1) * pageSize}, ${pageSize * pageNo}`)
        const count = await sql.query(`select count(*) as count from article where title like "%${title}%" and userId = '${id}'`)
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
router.get('/article/Info', async (ctx, next) => {
    const { id } = ctx.request.query
    const userId = ctx.state.user.id
    try {
        const result = await sql.query('select * from article where id = ? and userId = ?', [id, userId])
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
 * 修改文章状态
 * 0: 草稿。 1：完成。 2： 发布。 3: 删除
 */
router.post('/article/status', async (ctx, next) =>{
    const { status, id } = ctx.request.body
    const userId = ctx.state.user.id
    try {
        if (status !== 0 && status !== 1 && status !== 2 && status !== 3) {
            ctx.body = {
                state: 300,
                success: false,
                message: "请检查修改状态是否正确"
            }
        } else  {
            await sql.query(`update article set status = ? where id =? and userId = ?`, [status, id, userId])
            ctx.body = {
                state: 200,
                success: true,
                message: "修改成功",
            }
        }
    } catch (err) {
        throw err
    }
})


module.exports = router.routes()