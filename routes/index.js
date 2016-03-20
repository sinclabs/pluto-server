
//Reqire everything here
var express = require('express');
var router = express.Router();
var connection = require("../local_modules/mysql");

//When home page is requested
router.get('/', function(req, res, next) {

	connection.query('SELECT * from testTable', function(err, rows, fields) {
		if (!err){
			rows.forEach(function(row){
				console.log(row.id + " | " + row.testEntry)
			});
			//console.log('fields: ', fields);
		}	
		else{
			console.log(err);
		}
	});


	res.render('index', {Uploaded: "0"});
});




//Export the module
module.exports = router;
