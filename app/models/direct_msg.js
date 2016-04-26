var mongoose = require('mongoose')

var User = mongoose.model('User')
var Flag = mongoose.model('Flag')

var oneToOneMsgSessionSchema = new mongoose.Schema({
  user_one_fk_key: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  user_two_fk_key: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  ip: {type: String, required:true},
  session_time: {type: Date, default: Date.now}
});

var oneToOneMsgTextSchema = new mongoose.Schema({
  msgText: {type: String, required: true},
  user_id_fk_key: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  ip: {type: String, required:true},
  msg_time: {type: Date, default: Date.now},
  one_to_one_msg_session_fk_key: {type: mongoose.Schema.Types.ObjectId, ref: 'OneToOneMsgSession'}
});

var flagMsgSchema = new mongoose.Schema({
  one_to_one_msgtext_fk_key: {type: mongoose.Schema.Types.ObjectId, ref: 'OneToOneMsgText'},
  flag_action: {type: mongoose.Schema.Types.Number , ref: 'Flag'}
})

mongoose.model('OneToOneMsgSession', oneToOneMsgSessionSchema, 'OneToOneMsgSessions')
mongoose.model('OneToOneMsgText', oneToOneMsgTextSchema, 'OneToOneMsgTexts')
