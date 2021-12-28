const Router = require('koa-router')
const router = new Router
const sql = require('../../../controller/sql/index')
const util = require('../../../util/index')
const { v4: uuidv4 } = require('uuid');



/**
 *修改评论状态
 *  * 0: 待审核。 1：未读。 2： 已读。 3: 删除
 */
router.post('/article/comment/status', async (ctx, next) =>{
    const { status, id, titleId } = ctx.request.body
    const userId = ctx.state.user.id
    try {
        if (status !== 0 && status !== 1 && status !== 2 && status !== 3) {
            ctx.body = {
                state: 300,
                success: false,
                message: "请检查修改状态是否正确"
            }
        } else  {
            let result =  await sql.query(`select userId from article where id = ?`, [titleId])
            if (userId === result[0].userId) {
                await sql.query(`update comment set status = ? where id =?`, [status, id])
                ctx.body = {
                    state: 200,
                    success: true,
                    message: "修改成功",
                }
            } else {
                ctx.body = {
                    state: 300,
                    success: false,
                    message: "无权限修改它人文章的评论",
                }
            }
        }
    } catch (err) {
        throw err
    }
})
/*
* 作者回复评论
 */
router.post('/replay', async(ctx, next) => {
    const { name, id } = ctx.state.user
    const { comment, titleId, pid, replyId } = ctx.request.body
    if (!comment || !titleId || !name) {
        ctx.body = {
            state: 300,
            success: false,
            message:  "错误！评论信息填写不完整！"
        }
    }
    try {
        await sql.query('insert into comment(comment, titleId, pid, name, replyId, status, id) values(?,?,?,?,?,1,uuid())',
            [comment, titleId, pid, name, replyId])
        ctx.body = {
            state: 200,
            success: true,
            message: '回复成功'
        }
    } catch (err) {
        throw err
    }
})
/**
 *返回给作者的评论审核，评论回复，点赞信息，留言
 */
router.get('/getCommentList', async (ctx, next) => {
    const { id } = ctx.state.user
    let { status, pageSize, pageNo } = ctx.request.query
    pageNo = pageNo || 1
    pageSize = pageSize || 10
    try {
        let result = await sql.query(`select 
            comment.*,
            DATE_FORMAT(comment.creatTime,\'%Y年%m月%d日%H时%i分%s秒\') as creatTime,
            DATE_FORMAT(comment.updateTime,\'%Y年%m月%d日%H时%i分%s秒\') as updateTime,
            article.id as titleId,
            article.title
            from comment, article where article.userId = '${id}' and comment.titleId
            = article.id and comment.status = '${status}' limit ${(pageNo - 1) * pageSize}, ${pageSize * pageNo}`)
        for (let v in result) {
            if (result[v].pid) {
                let replyData = await sql.query(`select * from comment where id = '${result[v].pid}'`)
                result[v].replyGroup = replyData[0]
            }
        }
        ctx.body = {
            state: 200,
            success: true,
            result: result
        }
    } catch (err) {
        throw err
    }
})



module.exports = router.routes()