const Router = require('koa-router')
const router = new Router
const sql = require('../../controller/sql/index')
const util = require('../../util/index')

/**
 * 创建评论
 */
router.post('/create', async(ctx, next) => {
      const { comment, titleId, pid, commentUserName, email } = ctx.request.body
      if (!comment || !titleId || !commentUserName) {
            ctx.body = {
                  state: 300,
                  success: false,
                  message:  "错误！评论信息填写不完整！"
            }
      }
      try {
            await sql.query('insert into comment(comment, titleId, pid, commentUserName, email, status, id) values(?,?,?,?,?,0,uuid())',
                [comment, titleId, pid, commentUserName, email])
            ctx.body = {
                  state: 200,
                  success: true,
                  message: '提交评论成功，将在审核过后显示'
            }
      } catch (err) {
            throw err
      }
})

module.exports = router.routes()
