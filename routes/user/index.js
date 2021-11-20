const Router = require('koa-router')
const router = new Router
const sql = require('../../controller/sql/index')
const jwt = require('jsonwebtoken')
const util = require('../../util/index')
const tokenTime = 1000 * 60 * 60
const secret = process.env.secret

router.post('/register', async (ctx, next) => {
    const { name, password } = ctx.request.body
    try {
        const  isExistName = await sql.query('select name from user where name = ?', [name])
        if(isExistName.length) {
            ctx.body = {
                state: 300,
                success: false,
                message: `当前用户名${name}已存在`
            }
        } else {
            await sql.query('insert into user(id, name, password) values(uuid(), ?,?)', [name, password])
            ctx.body = {
                state: 200,
                success: true,
                message: '注册成功'
            }
        }
    } catch(err) {
        throw err
    }
})

router.post('/login', async (ctx, next) => {
    const { name, password } = ctx.request.body
    try {
        const result = await sql.query('select name, password, id from user where name = ?', [name])
        if (password === result[0].password) {
            let { name, id } = result[0]
            const token = jwt.sign({ name, id }, secret, { expiresIn: tokenTime })
            ctx.body = {
                state: 200,
                success: true,
                message: '登录成功',
                data_token: token
            }
        } else {
            ctx.body = {
                state: 401,
                success: false,
                message: '密码错误'
            }
        }
    } catch(err) {
        ctx.throw(err)
    }
})

/*
修改用户除id和password外一切信息
 */
router.post('/editMessage', async (ctx, next) => {
    const file = ctx.request.files.head
    const { name, tag, introduction } = ctx.request.body
    let uploadPath = ctx.state.path + `\\${file.name}`
    const head = await util.uploadFile(file, uploadPath)
    const { id } = ctx.state.user
    let insert = util.filterUpdateValue({ name, tag, head, introduction })
    await sql.query(`update user set ${insert.keys.map(key => `${key} = ?`).join(',')} where id like ?`, [...insert.values, id])
    ctx.body = {
        message: '修改成功',
        url: head,
        success: true,
        state: 200
    }
})

/*
只能修改密码
 */
router.post('/changePassword', async (ctx, next) => {
    const { password } = ctx.request.body
    const regexp = new RegExp('^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)])+$).{6,20}$')
    if (regexp.test(password)) {
        try {
            const { id } = ctx.state.user
            await sql.query('update user set password = ? where id like ?', [password, id])
            ctx.body = {
                state: 200,
                success: true,
                message: '修改成功,重新登录后生效'
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

router.get('/isExist', async (ctx, next) => {
    try {
        const { name } = ctx.request.query
        const userName = await sql.query('SELECT * FROM user WHERE name = ?', [name])
        if (userName.length) {
            ctx.body = {
                state: 300,
                success: false,
                message: `当前用户名${name}已存在`
            }
        } else {
            ctx.body = {
                state: 200,
                success: true
            }
        }
    } catch (err) {
        throw err
    }
})


module.exports = router.routes()
