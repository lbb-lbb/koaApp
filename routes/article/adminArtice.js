const Router = require('koa-router')
const router = new Router
const sql = require('../../controller/sql/index')
const util = require('../../util/index')


/**
 * 创建文章或者修改文章
 */
router.post('/article/create', async (ctx, next) => {
    const { title, abstract, tag, category, status, content, id } = ctx.request.body
    const { id:userId, name } = ctx.state.user
    try {
        if(id) {
            let insert = util.filterUpdateValue({ title, abstract, tag, category, status, content })
            let a =  await sql.query(`update article set ${insert.keys.map(key => `${key} = ?`).join(',')} where id like ? and userId like ?`, [...insert.values, id, ctx.state.user.id])
            console.log(a)
            ctx.body = {
                message: '修改成功',
                success: true,
                state: 200
            }
        } else {
            let a = await sql.query('insert into article(id, title, abstract, tag, category, status, userId, content, userName) values(uuid(), ?, ?, ?, ? ,?, ?, ?, ?)',
                [title, abstract, tag, category, status, userId, content, name])
            console.log(a)
        }
        ctx.body = {
            state: 200,
            success: true,
            message: '提交成功'
        }
    } catch(err) {
        throw err
    }
})

/**
 * 删除文章
 */
router.post('/article/delete', async (ctx, next) => {
    const { id } = ctx.request.body
    console.log(id)
    await sql.query('delete from article where id = ?', [id])
    ctx.body = {
        message: "删除成功",
        success: true,
        state: 200
    }
})

/**
 * 返回文章列表
 */
router.get('/article/list', async (ctx,next) => {
    let { pageSize, pageNo, title, status } = ctx.request.query
    const { id } = ctx.state.user
    status = status || 2
    try {
        const result = await sql.query(`select title, id, abstract, tag, category, likeCount, readCount,
            commentCount, userName, DATE_FORMAT(creatTime,\'%Y年%m月%d日%H时') as creatTime, 
            DATE_FORMAT(updateTime,\'%Y年%m月%d日%H时\') as updateTime from article where title like "%${title}%" 
            and userId = '${id}' and status=${status} limit ${(pageNo - 1) * pageSize}, ${pageSize * pageNo}`)
        const count = await sql.query(`select count(*) as count from article where title like "%${title}%" and userId = '${id}'`)
        ctx.body =  {
            state: 200,
            success: true,
            result: result,
            count: count[0].count
        }
    } catch (err) {
        throw err
    }
})

/**
 * 文章详情
 */
router.get('/article/Info', async (ctx, next) => {
    const { id } = ctx.request.query
    const userId = ctx.state.user.id
    try {
        const result = await sql.query('select * from article where id = ? and userId = ?', [id, userId])
        ctx.body =  {
            state: 200,
            success: true,
            result: result
        }
    } catch (err) {
        throw err
    }
})
/**
 * 修改文章状态
 * 0: 草稿。 1：完成。 2： 发布。 3: 删除
 */
router.post('/article/status', async (ctx, next) =>{
    const { status, id } = ctx.request.body
    const userId = ctx.state.user.id
    try {
        if (status !== 0 && status !== 1 && status !== 2 && status !== 3) {
            ctx.body = {
                state: 300,
                success: false,
                message: "请检查修改状态是否正确"
            }
        } else  {
            await sql.query(`update article set status = ? where id =? and userId = ?`, [status, id, userId])
            ctx.body = {
                state: 200,
                success: true,
                message: "修改成功",
            }
        }
    } catch (err) {
        throw err
    }
})
/**
 *修改评论状态
 *  * 0: 待审核。 1：未读。 2： 已读。 3: 删除
 */
router.post('/article/comment/status', async (ctx, next) =>{
    const { status, id, titleId } = ctx.request.body
    const userId = ctx.state.user.id
    try {
        if (status !== 0 && status !== 1 && status !== 2 && status !== 3) {
            ctx.body = {
                state: 300,
                success: false,
                message: "请检查修改状态是否正确"
            }
        } else  {
            let result =  await sql.query(`select userId from article where id = ?`, [titleId])
            console.log(result)
            if (userId === result[0].userId) {
                console.log(id)
                await sql.query(`update comment set status = ? where id =?`, [status, id])
                ctx.body = {
                    state: 200,
                    success: true,
                    message: "修改成功",
                }
            } else {
                ctx.body = {
                    state: 300,
                    success: false,
                    message: "无权限修改它人文章的评论",
                }
            }
        }
    } catch (err) {
        throw err
    }
})
/*
* 作者回复评论
 */
router.post('/replay', async(ctx, next) => {
    const { name, id } = ctx.state.user
    const { comment, titleId, pid, replyId } = ctx.request.body
    if (!comment || !titleId || !name) {
        ctx.body = {
            state: 300,
            success: false,
            message:  "错误！评论信息填写不完整！"
        }
    }
    try {
        await sql.query('insert into comment(comment, titleId, pid, name, replyId, status, id) values(?,?,?,?,?,1,uuid())',
          [comment, titleId, pid, name, replyId])
        ctx.body = {
            state: 200,
            success: true,
            message: '回复成功'
        }
    } catch (err) {
        throw err
    }
})
/**
 *返回给作者的评论审核，评论回复，点赞信息，留言
 */
router.get('/getCommentList', async (ctx, next) => {
    const { id } = ctx.state.user
    let { status, pageSize, pageNo } = ctx.request.query
    pageNo = pageNo || 1
    pageSize = pageSize || 10
    try {
        let result = await sql.query(`select 
            comment.*,
            DATE_FORMAT(comment.creatTime,\'%Y年%m月%d日%H时%i分%s秒\') as creatTime,
            DATE_FORMAT(comment.updateTime,\'%Y年%m月%d日%H时%i分%s秒\') as updateTime,
            article.id as titleId,
            article.title
            from comment, article where article.userId = '${id}' and comment.titleId
            = article.id and comment.status = '${status}' limit ${(pageNo - 1) * pageSize}, ${pageSize * pageNo}`)
        for (let v in result) {
            if (result[v].pid) {
                let replyData = await sql.query(`select * from comment where id = '${result[v].pid}'`)
                result[v].replyGroup = replyData[0]
            }
        }
        ctx.body = {
            state: 200,
            success: true,
            result: result
        }
    } catch (err) {
        throw err
    }
})
/**
 * 返回文章的分类给作者选
 */
router.get('/article/classifyList', async (ctx, next) => {
    try {
        let result = await sql.query(`select tag, category from article`)
        let tags = [...new Set(result.map(v => v.tag).join(',').replace(/，/ig,',').split(','))]
        let category = [...new Set(result.map(v => v.category).join(',').split(','))]
        ctx.body = {
            state: 200,
            success: true,
            result: { tags, category }
        }
    } catch (err) {
        throw err
    }
})


module.exports = router.routes()
