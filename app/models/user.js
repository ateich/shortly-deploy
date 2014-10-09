var db = require('../config');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var userSchema = db.userSchema = mongoose.Schema({
  username: String,
  password: String
});

var User = mongoose.model('User', userSchema);

// User.prototype.comparePassword = function(password, callback){
//   console.log('user compare password function');
//   if(password === this.password){
//     callback(true);
//     return;
//   }
//   callback(false);
// };

userSchema.pre('save', function(next){
	this.hashPassword(function(err, hash){
		this.password = hash;
		next();
	}.bind(this));
});

User.prototype.comparePassword = function(attemptedPassword, callback) {
  bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
    callback(isMatch);
  });
};

User.prototype.hashPassword = function(callback){
  // var cipher = Promise.promisify(bcrypt.hash);
  bcrypt.genSalt(10, function(err, salt) {
   	bcrypt.hash(this.password, salt, null, callback);
	}.bind(this));
}

// var User = db.Model.extend({
//   tableName: 'users',
//   hasTimestamps: true,
//   initialize: function(){
//     this.on('creating', this.hashPassword);
//   },
//   comparePassword: function(attemptedPassword, callback) {
//     bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
//       callback(isMatch);
//     });
//   },
//   hashPassword: function(){
//     var cipher = Promise.promisify(bcrypt.hash);
//     return cipher(this.get('password'), null, null).bind(this)
//       .then(function(hash) {
//         this.set('password', hash);
//       });
//   }
// });

module.exports = User;
