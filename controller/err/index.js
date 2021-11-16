module.exports = async (ctx, next) => {
    try {
        await next()
    } catch(err) {
        console.error(err)
        if (err.status === 401) {
            ctx.status = 401;
            ctx.body = {
                error: err.originalError ? err.originalError.message : err.message
            };
        } else {
            ctx.body = {
                error: err
            }
        }
    }
}
