var express = require('express');
var cors = require('cors');
var bodyParser = require("body-parser");
var app = express();
var multer = require('multer');

var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: false
}));

var Users = require('./Routes/Users');
var api = require('./api.js');
var remote = require('./Routes/Remote');
app.use('/users',Users);
app.use('/api', api);
app.use('/remote', remote);
app.use(express.static(__dirname + '/uploads'));



var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
});

var upload = multer({ //multer settings
    storage: storage
}).single('photo');

/** API path that will upload the files */
app.post('/upload', function (req, res) {
    upload(req, res, function (err) {
        console.log(req.file);
        if (err) {
            res.json({
                success: 0,
                err_desc: err
            });
            return;
        }
        res.json({
            success: 1,
            err_desc: null,
            url: req.file.filename
        });
    });
});
var database = require('./Database/database');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
io.on('connection', function(socket){ 
    socket.on('message', (message) => {
        console.log(message);
        if(message.type == 'startChat') {
            console.log('create Table');
            database.connection.getConnection(function(err, connection) {
                var appData = {};
                if (err) {
                   
                } else {
                    connection.query("SELECT * FROM information_schema.tables WHERE table_schema = 'cherry' AND table_name = 'chat_" + message.staffId + "_" + message.userId +"' LIMIT 1", function(err, rows, fields) {
                        if (!err) {
                            
                            if(rows.length == 0) {
                                var sql = "CREATE TABLE `chart_" + message.staffId + "_" + message.userId +"` (`id` int(11) NOT NULL,`staff_id` int(11) NOT NULL,`user_id` int(11) NOT NULL,`message_type` int(11) NOT NULL,`message` text NOT NULL,`updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=latin1; ALTER TABLE `chart_"+message.staffId+ "_"+message.userId + "` ADD PRIMARY KEY (`id`);ALTER TABLE `chart_" + message.staffId + "_" + message.userId + "` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;";
                                connection.query(sql, function(error, con){

                                });
                            }
                        } else {
                            
                        }
                    });
                    connection.release();
                }
            });
        }

        if(message.type == 'userTostaff' || message.type == 'staffTouser') {
            database.connection.getConnection(function(err, connection) {
                if (err) {
                   
                } else {
                    var sql = "INSERT INTO `chart_"+message.staffId+"_"+message.userId+"` (`id`, `staff_id`, `user_id`, `message_type`, `message`, `updated`) VALUES (NULL, "+message.staffId+", "+message.userId+", 1, '"+message.msg+"', CURRENT_TIMESTAMP);"
                    connection.query(sql, function(err, rows, fields) {
                        if(!err){

                        }else {
                            console.log(err);
                        }
                    });
                    connection.release();
                }
            });
        }

        io.emit('message', {type: 'new-message', text: message});
    })
});

server.listen(port,function(){
    console.log("Server is running on port: "+port);
});