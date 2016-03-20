var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'plutoserver',
  password : '4LuT0',
  database : 'pluto'
});

module.exports = connection;
