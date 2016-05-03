//Reqire everything here
var express = require('express');
var router = express.Router();
var fs = require('fs');
//var connection = require("../local_modules/mysql");


router.get('/:id', function(req, res, next) {
	var id = req.params.id;
	// connection.query('SELECT * from testTable', function(err, rows, fields) {
	// 	if (!err){
	// 		rows.forEach(function(row){
	// 			console.log(row.id + " | " + row.testEntry)
	// 		});
	// 		//console.log('fields: ', fields);
	// 	}	
	// 	else{
	// 		console.log(err);
	// 	}
	// });
	var obj = JSON.parse(fs.readFileSync( "./public/AppData/assignments.pluto", 'utf8'));
	var assignment = search( id, obj);
	res.render('index', {Uploaded: "0", AssignmentID: id, AssignmentName: assignment[0].name});
});

function search(value, data){
	var results = [];
	var searchVal = value;
	var obj = data;
	
	for (var i=0 ; i < obj.assignments.length ; i++)
	{
	    if (obj.assignments[i].AssignmentID == searchVal) {
	        results.push(obj.assignments[i]);
	    }
	}
	return results;
}


//Export the module
module.exports = router;
