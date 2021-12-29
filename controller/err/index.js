module.exports = async (ctx, next) => {
    try {
        await next()
    } catch(err) {
        console.error(err)
        if (err.status === 401) {
            ctx.status = 401;
            ctx.body = {
                state: 401,
                success: false,
                message: err.originalError ? err.originalError.message : err.message
            };
        } else {
            if (err.state) {
                ctx.body = {
                    state: err.state,
                    message: err
                }
            }
            ctx.body = {
                state: 300,
                message: err
            }
        }
    }
}
