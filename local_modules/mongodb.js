var mongojs = require("mongojs");
var databaseUrl = "assembly";
var collections = ["users","assignments"];
var db = mongojs(databaseUrl, collections);

module.exports = db;
