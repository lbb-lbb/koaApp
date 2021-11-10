const Koa = require('koa2')
const Router = require('koa-router')
const bodyBody = require('koa-body');
const router = new Router()
const app = new Koa()
require('dotenv').config()

const err = require('./controller/err/index')
const jwt = require('./controller/jwt/index')

const user = require('./routes/user/index')
const port = 3005


app.use(bodyBody({
    multipart: true
}))

app.use(jwt)

router.use('/user', user.routes(), user.allowedMethods())

app.use(router.routes(), router.allowedMethods());

app.use(err)
//监听3000端口
app.listen(port, () => { console.log(`应用已运行于${port}端口`) });
