var mongoose = require('mongoose')
var _ = require('lodash')

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

var flagMsgSessionSchema = new mongoose.Schema({
  session_id_fk_key: {type: mongoose.Schema.Types.ObjectId, ref: 'OneToOneMsgSession'},
  flag_session_as: {type: mongoose.Schema.Types.Number, ref: 'Flag'},
  session_flagged_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  flagged_at: {type: Date, defualt: Date.now}
})

flagMsgSessionSchema.pre('save', true, function(next, done) {
  var self = this
  FlagMsgSession
                .findOne({session_id_fk_key: this.session_id_fk_key}, function(err, data) {
                  if (err) {
                    log.error(err)
                    next(err)
                  } else if (!_.isEmpty(data)) {
                    log.warn(util.inspect(data))
                    self.invalidate("_id", "session is already flagged")
                    next(new Error("session is already flagged as spam/abusive"))
                  } else {
                    log.info("flag msg session save pre hook passed")
                    next()
                  }
                })
  done()
})

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
var FlagMsgSession = mongoose.model('FlagMsgSession', flagMsgSessionSchema, 'FlagMsgSessions')
mongoose.model('OneToOneMsgText', oneToOneMsgTextSchema, 'OneToOneMsgTexts')
