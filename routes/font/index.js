const Router = require('koa-router')
const router = new Router
const article = require('./artice/index')
const comment = require('./comment/index')
const login = require('./login/index')
router.use(article)
    .use(comment)
    .use(login)

module.exports = router.routes()