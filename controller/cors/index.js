const cors = require('koa2-cors');

module.exports = cors({
    origin: function(ctx) {
        return '*'
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization', 'multipart/form-data', 'application/json'],
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
})
