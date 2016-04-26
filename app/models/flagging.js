var mongoose = require('mongoose')

var flagSchema = new mongoose.Schema({
  _id: {type: Number, required:true},
  flag_type: {type: String, required: true}
});

module.exports = mongoose.model('Flag', flagSchema, 'Flags')
