const fs = require('fs');

/**
 * 将接受到的文件和path写入到当前的path中
 */
module.exports.uploadFile = function (file, path) {
    let readStream = fs.createReadStream(file.path)
    let writeStream = fs.createWriteStream(path)
    if (!fs.existsSync(path)) {
        // todo
        readStream.pipe(writeStream)
        return path
    } else {
        readStream.pipe(writeStream)
        return path
    }
}
/**
 * 将插入为null或undefined的字段排除
 */
module.exports.filterUpdateValue = function(obj) {
    let newObj = JSON.parse(JSON.stringify(obj))
    for(let i in newObj) {
        if (newObj[i] === null || newObj[i] === undefined) {
            delete newObj[i]
        }
    }
    let keys = Object.keys(newObj)
    let values = Object.values(newObj)
    return { keys, values }
}
