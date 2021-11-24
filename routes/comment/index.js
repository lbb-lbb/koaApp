const Router = require('koa-router')
const router = new Router
const sql = require('../../controller/sql/index')
const util = require('../../util/index')

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
  const id = ctx.request.query.id
  try {
    let result = await sql.query(`select * from comment where titleId = ?`, [id])
    let commentList = result.filter(v => !v.pid)
    commentList.forEach(v => {
      v.reply = result.filter(s => v.id === s.pid)
      v.reply.forEach(q => {
        if(q.replyId) {
          q.replyGroup = result.filter(y => y.id === q.replyId)
        }
      })
    })
    ctx.body = {
      state: 200,
      success: true,
      result: commentList
    }
  } catch (err) {
    throw err
  }

})

module.exports = router.routes()
