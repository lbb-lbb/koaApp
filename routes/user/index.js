const Router = require('koa-router')
const router = new Router
const sql = require('../../controller/sql/index')
const jwt = require('jsonwebtoken')
const util = require('../../util/index')
const tokenTime = 1000 * 60 * 60
const secret = process.env.secret
const {Decrypt} = require("../../util/secret");

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
        const result = await sql.query('select * from user where name = ?', [name])
        console.log(Decrypt(password), 37)
        console.log(result[0].password, 38)
        console.log(Decrypt(result[0].password), 39)
        if (Decrypt(password) === Decrypt(result[0].password)) {
            let { name, id } = result[0]
            const token = jwt.sign({ name, id }, secret, { expiresIn: tokenTime })
            delete result[0].password
            ctx.body = {
                state: 200,
                success: true,
                message: '登录成功',
                token: token,
                result: result[0]
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
/**
 * 用户上传图片于目录并返回路径
 * @file 上传字段
 */
router.post('/upload', async (ctx, next) => {
    try {
        const file = ctx.request.files.file
        let uploadPath = ctx.state.uploadPath + `\/${file.name}`
        let path = ctx.state.path + `\/${file.name}`
        if (uploadPath) {
            await util.uploadFile(file, uploadPath)
            ctx.body = {
                state: 200,
                success: true,
                path: path
            }
        }
    } catch (err) {
        throw err
    }
})

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
            console.log(Decrypt(result[0].password))
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
