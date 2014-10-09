// NOTE: this file is not needed when using MongoDB
// var db = require('../config');
var User = require('../models/user');

var Users = function(){
};//new db.Collection();

Users.model = User;

Users.prototype.add = function(user){
	user.save();
}

module.exports = Users;