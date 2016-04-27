var mongoose = require('mongoose')
var util = require('util')

var log = require('../../config/logging')()

var User = mongoose.model('User')
var Flag = mongoose.model('Flag')
var OneToOneMsgSession = mongoose.model('OneToOneMsgSession')
var OneToOneMsgText = mongoose.model('OneToOneMsgText')

String.prototype.toObjectId = function() {
  var ObjectId = mongoose.Types.ObjectId
  return new ObjectId(this.toString())
}

var getDMs = function() {
}

var getDMById = function() {
  
}

var startDM = function(user_id, to, msgText, ip, cb) {
  try {
    User
     .find({
       '_id': { $in: [user_id.toObjectId(), to.toObjectId()]}
     })
     .exec(function(err, data) {
       if (err) {
         log.error(util.inspect(err))
         cb({"Error": err.message})
       } else if (data.length < 2) {
         var data = {
           status: 400,
           content: {"bad-request": "users dont exist"}
         }
         cb(null, data)
       } else {
         var msgSession = new OneToOneMsgSession({
           user_one_fk_key: user_id,
           user_two_fk_key: to,
           ip: ip
         })

         //save messaging session between any two users
         msgSession.save(function(err, sessionObj) {
           if (err) {
             log.error("error saving messaging session ->" + util.inspect(err))
             cb({"Error": err.message})
           } else {
             log.info("session object for " + user_id + "/" + to + " -> " + util.inspect(sessionObj))
             //finally record and save the message in msgText collection
             var msgTextObj = new OneToOneMsgText({
               user_id_fk_key: user_id,
               one_to_one_msg_session_fk_key: sessionObj._id,
               msg_text: msgText,
               ip: ip
             })

             msgTextObj.save(function(err, recordMsg) {
               if (err) {
                 log.error("error saving message text object ->" + util.inspect(err))
                 cb({"Error": err.message})
               } else {
                 log.info("messsge text object for " + user_id + "->" + util.inspect(recordMsg))

                 var data = {
                   status: 200,
                   content:  {
                     session_id: sessionObj._id,
                     messaging_id: recordMsg._id,
                     sender_user_id: user_id,
                     receiver_user_id: to,
                     text: recordMsg.msg_text,
                     ip: recordMsg.ip,
                     mtime: recordMsg.msg_time
                   }
                 }
                 cb(null, data)
               }
             }) //end of msgTextObj
           }
         }) //end of msgSession
       } //end of else
     }) //end of exec func
  } catch (err) {
    cb({"Error": err.message})
  }
}

var resumeDMById = function() {
  
}

var removeDMByMsgId = function() {
  
}

var flagMsgId = function() {
  
}

module.exports = {
  getDM: getDMs,
  getDMById: getDMById,
  startDM: startDM,
  resumeDMById: resumeDMById,
  removeDMByMsgId: removeDMByMsgId,
  flagMsgId: flagMsgId
}
