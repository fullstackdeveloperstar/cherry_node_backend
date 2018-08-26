var config = {};

config.port = 3306;

//Authentication
config.auth = false;

//Database
config.host = 'localhost'
config.database = 'cherry';
config.username = 'root';
config.password = '';
config.table_prefix = '';

//Pagination
config.paginate = true;
config.page_limit = 10;

module.exports = config;