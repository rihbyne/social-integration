var mongoose = require('mongoose')
var util = require('util')
var _ = require('lodash')

var log = require('../../config/logging')()

var User = mongoose.model('User')
var Flag = mongoose.model('Flag')
var OneToOneMsgSession = mongoose.model('OneToOneMsgSession')
var OneToOneMsgText = mongoose.model('OneToOneMsgText')

String.prototype.toObjectId = function() {
  var ObjectId = mongoose.Types.ObjectId
  return new ObjectId(this.toString())
}

var sessionExists = function(user_id, to, reportback) {
  OneToOneMsgSession
                    .find({
                      $and: [{user_one_fk_key: user_id}, {user_two_fk_key: to}]
                    }, function(err, data) {
                      if (err) {
                        log.error(err)
                        reportback({"Error": err.message})
                      } else if (data.length) {
                        log.warn("user session exist")
                        var errData = {
                          status: 400,
                          failed: "user session already exist"
                        }
                        reportback(errData)
                      } else {
                        log.info("session save pre hook passed")
                        reportback(null, data)
                      }
                    })
}

var getDMs = function(user_id, cb) {
  var filterOptions = [
    {path: 'user_one_fk_key', select: '_id username'},
    {path: 'user_two_fk_key', select: '_id username'},
    {
      path: 'latest_msg_text_id_fk_key',
      select: '_id user_id_fk_key msg_text msg_time',
      populate: {path: 'user_id_fk_key', select: '_id username'}
    }
  ]
  OneToOneMsgSession
                   .find({
                     $or: [{user_one_fk_key: user_id}, {user_two_fk_key: user_id}]
                   })
                   .populate(filterOptions)
                   .select('-ip -__v')
                   .lean()
                   .sort({session_time: -1})
                   .exec(function(err, data) {
                     if (err) {
                       log.error(util.inspect(err))
                       var errMsg = err.name === 'CastError'? "user_id not found": err.message
                       cb({"failed": errMsg, status: 400})
                     } else {
                       log.info("user sessions")
                       var alteredData = _.map(data, function(sessionObj) {
                         var obj = {
                           _id: sessionObj._id,
                           user_one: sessionObj.user_one_fk_key,
                           user_two: sessionObj.user_two_fk_key,
                           session_time: sessionObj.session_time,
                           sender: sessionObj.latest_msg_text_id_fk_key.user_id_fk_key,
                           last_msg: {
                             _id: sessionObj.latest_msg_text_id_fk_key._id,
                             msg_text: sessionObj.latest_msg_text_id_fk_key.msg_text,
                             msg_time: sessionObj.latest_msg_text_id_fk_key.msg_time
                           }
                         }

                         return obj
                       })

                       var result = {
                         status: 200,
                         content: alteredData
                       }
                       cb(null, result)
                     }
                   })
}

var getDMById = function(user_id, id, cb) {
  var filterOptions = { path: 'user_id_fk_key', select: '_id username'}
  OneToOneMsgText
                .find({
                  $and: [{one_to_one_msg_session_fk_key: id}, {flag_msg_as: null}]
                })
                .populate(filterOptions)
                .select('-ip -__v')
                .sort({msg_time: -1})
                .exec(function(err, data) {
                  if(err) {
                    log.error(util.inspect(err))
                    var errMsg = err.name === 'CastError'? {failed: "params dont exist", status: 400}: {failed: err.message}
                    cb(errMsg)
                  } else {
                    log.info('session conversation history \n')
                    var alteredData = _.map(data, function(msgObj) {
                      var obj = {
                        msg_time: msgObj.msg_time,
                        msg_text: msgObj.msg_text,
                        session_id: msgObj.one_to_one_msg_session_fk_key,
                        sender: msgObj.user_id_fk_key,
                        _id: msgObj._id
                      }
                      return obj
                    })

                    var result = {
                      status: 200,
                      content: alteredData
                    }
                    cb(null, result)
                  }
                })

  //OneToOneMsgText.aggregate(
  //  [
  //    { $match: {"one_to_one_msg_session_fk_key": id.toObjectId()}},
  //    //{ "$project": {"msg_time": 1 }},
  //    { "$group": {"_id": id.toObjectId()}},
  //    { "$sort": {"msg_time": -1}}
  //  ], function(err, results) {
  //  if (err) {
  //    log.error(util.inspect(err))
  //    var errMsg = err.name === 'CastError'? {failed: "params dont exist", status: 400}: {failed: err.message}
  //    cb(errMsg)
  //  } else {
  //    console.log(results)
  //  }
  //})
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

         sessionExists(user_id, to, function(err, pass) {
           if (err) {
             cb(err)
           } else {
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
                     //update latest msg text foreign key in msgSession
                     msgSession.latest_msg_text_id_fk_key = recordMsg._id
                     msgSession.save(function(err, revisedSessionObj) {
                       if (err) {
                         log.error("error updating latest msg id in session " + util.inspect(err))
                         cb({"Error": err.message})
                       } else {
                         log.info("msg_text_id saved in session for " + user_id + " -> " + util.inspect(revisedSessionObj))

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
                     })// end of updating msg session
                   }
                 }) //end of msgTextObj
               }
             }) //end of msgSession
           } //end of else clause
         }) //end of sessionExists
       } //end of else
     }) //end of exec func
  } catch (err) {
    cb({"Error": err.message})
  }
}

var resumeDMById = function(user_id, id, ip, msgText, cb) {
  OneToOneMsgSession
                   .findOne({
                     $and: [{_id: id}, {$or:[{user_two_fk_key: user_id}, {user_one_fk_key: user_id}]}]
                   })
                   .select('latest_msg_text_id_fk_key')
                   .exec(function(err, sessionObj) {
                     if (err) {
                       log.error(util.inspect(err))
                       var errMsg = err.name === 'CastError'? {failed: "params dont exist", status: 400}: {failed: err.message}
                       cb(errMsg)
                     } else {
                       console.log(util.inspect(sessionObj))
                       console.log(typeof(sessionObj))
                       var msgTextObj = new OneToOneMsgText({
                         msg_text: msgText,
                         user_id_fk_key: user_id,
                         ip: ip,
                         one_to_one_msg_session_fk_key: id
                       })

                       msgTextObj.save(function(err, msgObj) {
                         if (err) {
                           log.error(util.inspect(err))
                           cb({"failed": err.message})
                         } else {
                           sessionObj.latest_msg_text_id_fk_key = msgObj._id
                           sessionObj.save(function(err, updatedsession) {
                             if (err) {
                               log.error(util.inspect(err))
                               cb({"failed": err.message})
                             } else {
                               var obj = {
                                 _id: msgObj._id,
                                 msg_text: msgObj.msg_text,
                                 msg_time: msgObj.msg_time,
                                 sender_id: msgObj.user_id_fk_key,
                                 session_id: updatedsession._id
                               }
                               var result = {
                                 status: 200,
                                 content: obj
                               }
                               cb(null, result)
                             }
                           }) //end of sessionObj
                         } // end of else
                       }) //end of msgTextObj
                     } //end of exec else
                   }) //end of exec
}

var removeDMByMsgId = function(user_id, id, msg_id, cb) {
  OneToOneMsgText
                .findOneAndRemove({
                  $and: [{user_id_fk_key: user_id}, {one_to_one_msg_session_fk_key: id}, {_id: msg_id}]
                })
                .exec(function(err, delObj) {
                  if (err) {
                    log.error(util.inspect(err))
                    var errMsg = err.name === 'CastError'? {failed: "params dont exist", status: 400}: {failed: err.message}
                    cb(errMsg)
                  } else {
                    var objExist = delObj? {status: 200, content: delObj}: (
                      {status: 400, content: {"failed": "Object doesnt exist"}}
                    )
                    cb(null, objExist)
                  }
                })
}

var getFlagOptions = function(cb) {
  Flag
     .find()
     .exec(function(err, flags) {
       if(err) {
         log.error(util.inspect(err))
         cb({failed: err.message})
       } else {
         log.info(flags)
         var flagObj = { status: 200, content: flags}
         cb(null, flagObj)
       }
     })
}

var flagMsgId = function(user_id, id, msg_id, flag_id, cb) {
  OneToOneMsgText
                .findOne({
                  $and: [{user_id_fk_key: user_id}, {one_to_one_msg_session_fk_key: id}, {_id: msg_id}]
                })
                .select('-__v -ip')
                .exec(function(err, msgObj) {
                  try {
                    if (err) {
                      log.error(util.inspect(err))
                      var errMsg = err.name === 'CastError'? {failed: "params dont exist", status: 400}: {failed: err.message}
                      cb(errMsg)
                    } else {
                      msgObj.flag_msg_as = flag_id
                      msgObj.save(function(err, data) {
                        if (err) {
                          log.error(util.inspect(err))
                          cb({failed: err.message})
                        } else {
                          var result = {
                            status: 200,
                            content: {
                              _id: data._id,
                              user_id: data.user_id_fk_key,
                              msg_text: data.msg_text,
                              msg_time: data.msg_time,
                              flag_msg_as: data.flag_msg_as,
                              session_id: data.one_to_one_msg_session_fk_key
                            }
                          }
                          cb(null, result)
                        }
                      })
                    }
                  } catch(err) {
                    cb({failed: err.message})
                  }
                })
}

module.exports = {
  getDMs: getDMs,
  getDMById: getDMById,
  startDM: startDM,
  resumeDMById: resumeDMById,
  removeDMByMsgId: removeDMByMsgId,
  getFlagOptions: getFlagOptions,
  flagMsgId: flagMsgId
}
