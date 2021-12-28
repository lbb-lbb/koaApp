const jwt = require('koa-jwt')

const secret = process.env.secret

module.exports = jwt({secret: secret}).unless({
    path: [/\/font/]
})
