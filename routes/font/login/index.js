const Router = require('koa-router')
const router = new Router
const sql = require('../../../controller/sql/index')
const jwt = require('jsonwebtoken')
const util = require('../../../util/index')
const tokenTime = 1000 * 60 * 60
const secret = process.env.secret
const {Decrypt} = require("../../../util/secret");

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