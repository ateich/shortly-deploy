var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');

var linkSchema = mongoose.Schema({
  url: String,
  title: String,
  code: String
});

linkSchema.post('init', function(doc){
  this.createShortLink();
  // next();
});

linkSchema.pre('save', function(next){
  this.createShortLink();
  next();
});

var Link = mongoose.model('Link', linkSchema);

Link.prototype.createShortLink = function(){
  if(!this.code){
    var shasum = crypto.createHash('sha1');
    console.log('create sha with: ', this.url);
    shasum.update(this.url);
    this.code = shasum.digest('hex').slice(0, 5);
    console.log('sha created: ', this.code);
  }
};

// var Link = db.Model.extend({
//   tableName: 'urls',
//   hasTimestamps: true,
//   defaults: {
//     visits: 0
//   },
//   initialize: function(){
//     this.on('creating', function(model, attrs, options){
//       var shasum = crypto.createHash('sha1');
//       shasum.update(model.get('url'));
//       model.set('code', shasum.digest('hex').slice(0, 5));
//     });
//   }
// });

module.exports = Link;
