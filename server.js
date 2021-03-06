var express = require('express');
var cors = require('cors');
var bodyParser = require("body-parser");
var app = express();
var multer = require('multer');
const https = require("https");
const http = require("http");
const fs = require("fs");
const options = {
  key: fs.readFileSync("/var/www/server.key"),
  cert: fs.readFileSync("/var/www/server.crt")
};


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
var server = https.createServer(options,app);
// var server = http.createServer(app);
var io = require('socket.io')(server);
io.on('connection', function(socket){ 
    socket.on('message', (message) => {
        if(message.type == 'userTostaff' || message.type == 'staffTouser') {
            database.connection.getConnection(function(err, connection) {
                if (err) {
                   
                } else {
                    if(message.staffId == '') {
                        message.staffId = -1;
                    }
                    var isMedia = message.isMedia == undefined || !message.isMedia   ? "0": "1";
                    console.log('is_media:     ' + isMedia);
                    var sql = "INSERT INTO `chat` (`id`, `staff_id`, `user_id`, `message_type`, `message` , `isMedia` , `updated`) VALUES (NULL, "+message.staffId+", "+message.userId+", '" + message.type + "', '"+message.msg+"', "+ isMedia +", CURRENT_TIMESTAMP);"
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

        if(message.type == 'requestchat') {
            var sql = "INSERT INTO `request` (`id`,`user_id`) VALUES (NULL, '" + message.userId + "');";
            database.connection.getConnection(function(err, connection) {
                if (err) {
                   
                } else {
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

        if (message.type == 'acceptchat') {
            var sql  =  "DELETE FROM `request` WHERE `user_id`=" + message.userId;
            database.connection.getConnection(function(err, connection) {
                if (err) {
                   
                } else {
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