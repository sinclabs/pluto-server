var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require('fs');
var multer  = require('multer');
var connection = require("./local_modules/mysql");

var index = require('./routes/index');
var dataGrab = require('./routes/dataGrab')

var app = express();

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


app.use('/', index);
app.use('/dataGrab', dataGrab);

var upload = multer({ dest: '/files/' });

app.post('/upload', upload.array('file'), function(req, res, next) {
  console.log(req.body.name);
  console.log(req.body.email);
  console.log(req.body.plutoid);
  console.log(req.files);
  var fileNameList = "";
  for(var i=0;i<req.files.length;i++){
    fileNameList += req.files[i].originalname
    fileNameList += req.files[i].mimetype + "|";
    fileNameList += req.files[i].size + "|";
    if(i != req.files.length-1)
      fileNameList += '*';
  }
  console.log(fileNameList);
  for(var i=0; i<req.files.length; i++){
    var buffer = fs.readFileSync(req.files[i].path);
    var newPath = __dirname + "/files/" +req.files[i].originalname;
    fs.writeFileSync(newPath, buffer);
  }
  var sqlQuery = 'insert into students (name, email, createdby, createdDateTime) values (\"'+req.body.name+'\", \"'+req.body.email+'\", '+req.body.plutoid+', NOW()); ';
  console.log(sqlQuery);
  connection.query(sqlQuery, function(err, rows, fields) {
    if (!err){
      console.log("1st Query Done");
      sqlQuery = 'select StudentID from students order by StudentID DESC LIMIT 1;';
      connection.query(sqlQuery, function(err, rows, fields) {
        if(!err){
          console.log("2nd Query Done");
          rows.forEach(function(row){
            sqlQuery = 'insert into submissions (fileList, AssignmentID, StudentID, CreatedBy, CreatedDateTime) values (\"'+fileNameList+'\",'+req.body.plutoid+','+row.StudentID+','+row.StudentID+', NOW());';
            console.log(sqlQuery);
            connection.query(sqlQuery, function(err, rows, fields) {
              if (!err){
                console.log("3rd Query Done");
                console.log("Success");
                res.render('index', {Uploaded: "1"});
              } 
              else{
                console.log(err);
                res.send('404');
              }
            });
          });
        }
        else{
          console.log(err);
          res.send('404');
        }
      });
    } 
    else{
      console.log(err);
      res.send('404');
    }
  });
  
});

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
