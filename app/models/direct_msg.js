var mongoose = require('mongoose')

var User = mongoose.model('User')
//var Flag = mongoose.model('Flag')

var util = require('util')
var log = require('../../config/logging')()

var oneToOneMsgSessionSchema = new mongoose.Schema({
  user_one_fk_key: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  user_two_fk_key: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  latest_msg_text_id_fk_key: {type: mongoose.Schema.Types.ObjectId, ref: 'OneToOneMsgText', default: null},
  ip: {type: String, required:true},
  session_time: {type: Date, default: Date.now}
});

//oneToOneMsgSessionSchema.pre('save', true, function(next, done) {
//  var self = this
//  OneToOneMsgSession
//                    .find({
//                      $and: [{user_one_fk_key: this.user_one_fk_key}, {user_two_fk_key: this.user_two_fk_key}]
//                    }, function(err, data) {
//                      if (err) {
//                        log.error(err)
//                        next(err)
//                      } else if (data.length) {
//                        log.warn(util.inspect(data))
//                        self.invalidate("_id", "session already exist")
//                        next(new Error("session already exist"))
//                      } else {
//                        log.info("session save pre hook passed")
//                        next()
//                      }
//                    })
//  done()
//})

var oneToOneMsgTextSchema = new mongoose.Schema({
  msg_text: {type: String, required: true},
  user_id_fk_key: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  ip: {type: String, required:true},
  msg_time: {type: Date, default: Date.now},
  one_to_one_msg_session_fk_key: {type: mongoose.Schema.Types.ObjectId, ref: 'OneToOneMsgSession'},
  flag_msg_as: {type: mongoose.Schema.Types.Number, ref:'Flag', default: null}
});

var OneToOneMsgSession = mongoose.model('OneToOneMsgSession', oneToOneMsgSessionSchema, 'OneToOneMsgSessions')
mongoose.model('OneToOneMsgText', oneToOneMsgTextSchema, 'OneToOneMsgTexts')
