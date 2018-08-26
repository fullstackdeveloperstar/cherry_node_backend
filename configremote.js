var config = {};

config.port = 3306;

//Authentication
config.auth = false;

//Database
config.host = 'pheramor-stag.cluster-cj8f6wiiyeqq.us-east-1.rds.amazonaws.com'
config.database = 'pheramor_stag_db';
config.username = 'pheramor_super';
config.password = 'tBOibOJwEl%rS6';
config.table_prefix = '';

//Pagination
config.paginate = true;
config.page_limit = 10;

module.exports = config;