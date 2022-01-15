const Koa = require('koa2')
const Router = require('koa-router')
const bodyBody = require('koa-body');
const static = require('koa-static')
const router = new Router()
const app = new Koa()
require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? './.env.production' : './.env.development'
})
require('dotenv').config({
    path: './.env'
})

if (process.env.NODE_ENV === 'production') {
    console.log('这是生产环境运行：production')
} else if (process.env.NODE_ENV === 'development') {
    console.log('这是开发环境运行：development')
} else {
    console.log('运行node文件时未设置NODE_ENV="开发or生产"，将为您默认选择开发环境！加载.env.development文件')
}

const err = require('./controller/err/index')
const jwt = require('./controller/jwt/index')
const cors = require('./controller/cors/index')

const font = require('./routes/font/index')
const admin = require('./routes/admin/index')


app.use(cors)
app.use(err)
app.use(static((__dirname + '/static'), {
    maxAge: 31536000
}))
app.use(async function (ctx, next) {
    ctx.state.path = process.env.BASE_URL
    ctx.state.uploadPath = __dirname + '/static/images'
    await next();
})
app.use(bodyBody({
    multipart: true,
    formidable: {
        maxFileSize: 200*1024*1024*10,    // 设置上传文件大小最大限制
        keepExtensions: true // 保留文件拓展名
    }
}))

app.use(jwt)

router.use('/font', font)
router.use('/admin', admin)
app.use(router.routes(), router.allowedMethods());
//监听3000端口
app.listen(process.env.PROT, () => { console.log(`应用已运行于${process.env.PROT}端口`) });
