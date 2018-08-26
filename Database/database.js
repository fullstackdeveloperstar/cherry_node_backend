var mysql = require('mysql');
var config = require('../config');

console.log(config.host);
var connection = mysql.createPool({
    connectionLimit: 100,
    host:config.host,
    user:config.username,
    password:config.password,
    database:config.database,
    port: config.port,
    debug: false,
    multipleStatements: true
});

module.exports.connection = connection;