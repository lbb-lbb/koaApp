const Koa = require('koa2')
const Router = require('koa-router')
const bodyBody = require('koa-body');
const static = require('koa-static')
const router = new Router()
const app = new Koa()
require('dotenv').config()

const err = require('./controller/err/index')
const jwt = require('./controller/jwt/index')
const cors = require('./controller/cors/index')

const user = require('./routes/user/index')
const article = require('./routes/article/adminArtice')
const articleShow = require('./routes/article/artice')
const comment = require('./routes/comment/index')
const port = 3005

app.use(cors)
app.use(err)
app.use(static(__dirname + '/static'))
app.use(async function (ctx, next) {
    ctx.state.path = `http://localhost:3005/static`
    await next();
})
app.use(bodyBody({
    multipart: true,
    formidable: {
        maxFileSize: 200*1024*1024*1024,    // 设置上传文件大小最大限制，默认2M
        keepExtensions: true // 保留文件拓展名
    }
}))

app.use(jwt)

router.use('/user', user)
router.use('/page', article)
router.use('/common', articleShow)
router.use('/discuss', comment)
app.use(router.routes(), router.allowedMethods());

//监听3000端口
app.listen(port, () => { console.log(`应用已运行于${port}端口`) });
