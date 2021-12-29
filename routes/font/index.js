const Router = require('koa-router')
const router = new Router
const article = require('./artice/index')
const comment = require('./comment/index')
const login = require('./login/index')
const userMessage = require('./userMessage/index')
router.use(article)
    .use(comment)
    .use(login)
    .use(userMessage)

module.exports = router.routes()