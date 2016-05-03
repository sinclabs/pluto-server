var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require('fs');
var multer  = require('multer');
//var connection = require("./local_modules/mysql");
var upload = multer({ dest: '/files/' });

var index = require('./routes/index');
var dataGrab = require('./routes/dataGrab')

var app = express();
var WebSocketServer = require("ws").Server;
var http = require("http");
var port = process.env.PORT || 5000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'images/logo.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: '@ss3mB1y'}));

var server = http.createServer(app)
server.listen(port)

console.log("http server listening on %d", port)

var wss = new WebSocketServer({server: server}),
clients=[];
console.log("websocket server created")

wss.on("connection", function(ws) {
  ws.send("Pluto/Handshake/ID");

  ws.on('message', function(message){
    var s = message.split(':');
    if(s[0] === "Pluto/Handshake/ID"){
      console.log('id: '+s[1]);
      var conn = {
        "id": s[1],
        "connection": this
      }
      clients.push(conn);
      ws.send("submissions$"+fs.readFileSync( "./public/AppData/submissions.pluto", 'utf8'));
      ws.send("students$"+fs.readFileSync( "./public/AppData/students.pluto", 'utf8'));
      ws.send("courses$"+fs.readFileSync( "./public/AppData/courses.pluto", 'utf8'));
      ws.send("assignments$"+fs.readFileSync( "./public/AppData/assignments.pluto", 'utf8'));
    }
  });

  console.log("websocket connection open")

  ws.on("close", function() {
    console.log("websocket connection close");
  });
});

app.use('/dataGrab', dataGrab);

app.post('/upload', upload.array('file'), function(req, res, next) {
  var fileNameList = "";
  for(var i=0;i<req.files.length;i++){
    fileNameList += req.files[i].originalname + "|";
    fileNameList += req.files[i].mimetype + "|";
    fileNameList += req.files[i].size + "|";
    if(i != req.files.length-1)
      fileNameList += '*';
  }
  for(var i=0; i<req.files.length; i++){
    var buffer = fs.readFileSync(req.files[i].path);
    var newPath = __dirname + "/files/" +req.files[i].originalname;
    fs.writeFileSync(newPath, buffer);
  }
  var obj = JSON.parse(fs.readFileSync( "./public/AppData/submissions.pluto", 'utf8'));
  var SubmissionID = 0;
  if(obj.submissions.length>0){
    for(var i=0; i<obj.submissions.length; i++){
      if(obj.submissions[i].SubmissionID > SubmissionID){
        SubmissionID = obj.submissions[i].SubmissionID;
      }
    }  
  }
  var stuobj = JSON.parse(fs.readFileSync( "./public/AppData/students.pluto", 'utf8'));
  var results = [];
  var StudentID = 0;
  for (var i=0 ; i < stuobj.students.length ; i++)
  {
      if (stuobj.students[i].email == req.body.email) {
          results.push(stuobj.students[i]);
      }
  }
  if(results.length == 0){
    if(stuobj.students.length>0){
      for(var i=0; i<stuobj.students.length; i++){
        if(stuobj.students[i].StudentID > StudentID){
          StudentID = stuobj.students[i].StudentID;
        }
      }  
    }
    var stuData = {
      "StudentID": StudentID+1,
      "name": req.body.name,
      "email": req.body.email,
      "CreatedBy":"1",
      "CreatedDateTime": getDateTime(),
      "ModifiedBy": "NULL",
      "ModifiedDateTime": "NULL"
    }
    stuobj.students.push(stuData);
    fs.writeFileSync("./public/AppData/students.pluto",JSON.stringify(stuobj));
    StudentID = StudentID+1;
  }
  else{
    StudentID = results[0].StudentID;
  }

  var uploadData = {
      "SubmissionID": SubmissionID+1,
      "fileList": fileNameList,
      "AssignmentID": req.body.plutoid,
      "StudentID": StudentID,
      "CreatedBy": "1",
      "CreatedDateTime": getDateTime(),
      "ModifiedBy": "NULL",
      "ModifiedDateTime": "NULL"
  }
  console.log(uploadData);
  obj.submissions.push(uploadData);
  fs.writeFileSync("./public/AppData/submissions.pluto",JSON.stringify(obj));
  for(var i=0; i<clients.length; i++){
    console.log('here')
    var ws = clients[i].connection;
    ws.send("submissions$"+fs.readFileSync( "./public/AppData/submissions.pluto", 'utf8'));
    ws.send("students$"+fs.readFileSync( "./public/AppData/students.pluto", 'utf8'));
    ws.send("courses$"+fs.readFileSync( "./public/AppData/courses.pluto", 'utf8'));
    ws.send("assignments$"+fs.readFileSync( "./public/AppData/assignments.pluto", 'utf8'));
  }
  res.render('index', {Uploaded: "1"});
  
  function getDateTime() {
    var now     = new Date(); 
    var year    = now.getFullYear();
    var month   = now.getMonth()+1; 
    var day     = now.getDate();
    var hour    = now.getHours();
    var minute  = now.getMinutes();
    var second  = now.getSeconds(); 
    if(month.toString().length == 1) {
        var month = '0'+month;
    }
    if(day.toString().length == 1) {
        var day = '0'+day;
    }   
    if(hour.toString().length == 1) {
        var hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
        var minute = '0'+minute;
    }
    if(second.toString().length == 1) {
        var second = '0'+second;
    }   
    var dateTime = year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second;   
     return dateTime;
}

});

app.use('/assignment', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
