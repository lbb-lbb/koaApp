const Router = require('koa-router')
const router = new Router
const sql = require('../../../controller/sql/index')
const util = require('../../../util/index')

/**
 * 创建评论
 */
router.post('/create', async(ctx, next) => {
    const { comment, titleId, pid, name, email, replyId } = ctx.request.body
    if (!comment || !titleId || !name) {
        ctx.body = {
            state: 300,
            success: false,
            message:  "错误！评论信息填写不完整！"
        }
    }
    try {
        await sql.query('insert into comment(comment, titleId, pid, name, email, replyId, status, id) values(?,?,?,?,?,?,0,uuid())',
            [comment, titleId, pid, name, email, replyId])
        ctx.body = {
            state: 200,
            success: true,
            message: '提交评论成功，将在审核过后显示'
        }
    } catch (err) {
        throw err
    }
})
/**
 * 返回文章下的评论
 */
router.get('/getComment', async (ctx, next) => {
    const { id, pageNo, pageSize } = ctx.request.query
    try {
        let result = await sql.query(`select *, DATE_FORMAT(creatTime,\'%Y年%m月%d日%H时%i分%s秒\') as creatTime,
        DATE_FORMAT(updateTime,\'%Y-%m-%d %H:%i:%s\') as updateTime
        from comment where status = 1 and titleId = ? order by creatTime desc`, [id])
        let countComment = result.filter(v => !v.pid)
        let commentList = countComment.slice((pageNo - 1) * pageSize, pageSize * pageNo)
        commentList.forEach(v => {
            v.reply = result.filter(s => v.id === s.pid)
            v.reply.forEach(q => {
                if(q.replyId) {
                    q.replyGroup = JSON.parse(JSON.stringify(result)).filter(y => y.id === q.replyId)
                }
            })
        })
        ctx.body = {
            state: 200,
            success: true,
            result: commentList,
            count: countComment.length
        }
    } catch (err) {
        throw err
    }

})

module.exports = router.routes()
