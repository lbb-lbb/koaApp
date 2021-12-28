const Router = require('koa-router')
const router = new Router
const user = require('./user/index')
const upload = require('./upload/index')
const article = require('./article/index')
const comment = require('./comment/index')
router.use(user)
    .use(upload)
    .use(article)
    .use(comment)


module.exports = router.routes()