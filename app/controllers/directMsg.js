var mongoose = require('mongoose')

var User = mongoose.model('User')
var Flag = mongoose.model('Flag')
var OneToOneMsgSession = mongoose.model('OneToOneMsgSession')
var OneToOneMsgText = mongoose.model('OneToOneMsgText')

var log = require('../../config/logging')()
var helpers = require('../helpers/utils')
var dmCommon = require('./directMsgCommon')

var getDMs = function(req, res) {
  if (req.params.id) {
    dmCommon.getDMs(req.params.id, function(err, result)) {
      if (err) {
        helpers.sendJsonResponse(res, 500, err)
        return
      } else {
        log.info(util.inspect(result))
        helpers.sendJsonResponse(res, result.status, result.content)
        return
      }
    }
  } else {
    var content = {"status": "required fields not found"}
    log.warn(util.inspect(content))
    helpers.sendJsonResponse(res, 400, content)
  }
}

var getDMById = function(req, res) {
}

var startDM = function(req, res) {
  //first, save the session document between any two users
  //finally, save the msgtext and return the response with session_id
  if (req.params.user_id && req.body.ip && req.body.to && req.body.msgText) {
    var user_id = req.params.user_id,
        to = req.body.to,
        ip = req.body.ip,
        msgText = req.body.msgText

    dmCommon.startDM(user_id, to, msgText, ip, function(err, result) {
      if (err) {
        helpers.sendJsonResponse(res, 500, err)
        return
      } else {
        log.info(util.inspect(result))
        helpers.sendJsonResponse(res, result.status, result.content)
        return
      }
    })

  } else {
    var content = {"status": "required fields not found"}
    log.warn(util.inspect(content))
    helpers.sendJsonResponse(res, 400, content)
  }
}

var resumeDMById = function(req, res) {
}

var removeDMByMsgId = function(req, res) {
}

var flagMsgId = function(req, res) {
}

module.exports = {
  getDMs: getDMs,
  getDMById: getDMById,
  startDM: startDM,
  resumeDMById: resumeDMById,
  removeDMByMsgId: removeDMByMsgId,
  flagMsgId: flagMsgId
}
