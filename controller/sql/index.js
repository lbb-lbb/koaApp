const mysqlDb = require("mysql2");


const options = {
    host: process.env.SQL_IP,
    user: process.env.SQL_USER,
    port: process.env.SQL_HOST,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASES,
    multipleStatements: true
};
const pool = mysqlDb.createPool(options);
module.exports.query = function (sql, values = []) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err)
            } else {
                connection.query(sql, values, (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        connection.release();
                        resolve(results)
                    }
                });
            }
        })
    })
}
