const Router = require('koa-router')
const router = new Router
const util = require('../../../util/index')



/**
 * 用户上传图片于目录并返回路径
 * @file 上传字段
 */
router.post('/upload', async (ctx, next) => {
    try {
        const file = ctx.request.files.file
        // 由于win系统和linux系统上传文件存在双反斜杠和反斜杠的区别，故此将所有的双反斜杠转化为斜杠，斜杠在两个系统都支持使用
        let PathName = ctx.request.files.file.path.replace(/\\/g,"/").split('/').pop()
        let uploadPath = ctx.state.uploadPath + `/${PathName}`
        let path = ctx.state.path + `/${PathName}`
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

module.exports = router.routes()