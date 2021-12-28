const Router = require('koa-router')
const router = new Router
const sql = require('../../../controller/sql/index')
const util = require('../../../util/index')
const {Decrypt} = require("../../../util/secret");

/*
修改用户除id和password外一切信息
 */
router.post('/editMessage', async (ctx, next) => {
    const { name, tag, introduction, head } = ctx.request.body
    const { id } = ctx.state.user
    let insert = util.filterUpdateValue({ name, tag, head, introduction })
    await sql.query(`update user set ${insert.keys.map(key => `${key} = ?`).join(',')} where id like ?`, [...insert.values, id])
    const result = await sql.query('select * from user where id = ?', [id])
    delete result[0].password
    ctx.body = {
        message: '修改成功',
        success: true,
        state: 200,
        result: result[0]
    }
})

/*
只能修改密码
 */
router.post('/changePassword', async (ctx, next) => {
    const { password, oldPassword } = ctx.request.body
    const regexp = new RegExp('^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)])+$).{6,20}$')
    if (regexp.test(Decrypt(password))) {
        try {
            const { id } = ctx.state.user
            const result = await sql.query(`select password from user where id like ?`, [id])
            if (Decrypt(result[0].password) === Decrypt(oldPassword)) {
                await sql.query('update user set password = ? where id like ?', [password, id])
                ctx.body = {
                    state: 200,
                    success: true,
                    message: '修改成功,重新登录后生效'
                }
            } else {
                ctx.body = {
                    state: 300,
                    success: false,
                    message: '原密码输入错误'
                }
            }
        } catch(err) {
            throw err
        }
    } else {
        ctx.body = {
            state: 300,
            success: false,
            message: '密码包含 数字,英文,字符中的两种以上，长度6-20'
        }
    }
})

module.exports = router.routes()
