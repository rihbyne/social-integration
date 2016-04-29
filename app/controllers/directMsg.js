var mongoose = require('mongoose')

var User = mongoose.model('User')
var Flag = mongoose.model('Flag')
var OneToOneMsgSession = mongoose.model('OneToOneMsgSession')
var OneToOneMsgText = mongoose.model('OneToOneMsgText')

var log = require('../../config/logging')()
var helpers = require('../helpers/utils')
var dmCommon = require('./directMsgCommon')

var getDMs = function(req, res) {
    dmCommon.getDMs(req.params.user_id, function(err, result) {
      if (err) {
        var status = err.status? err.status: 500
        helpers.sendJsonResponse(res, status, err)
        return
      } else {
        log.info(util.inspect(result))
        helpers.sendJsonResponse(res, result.status, result.content)
        return
      }
    })
}

var getDMById = function(req, res) {
    dmCommon.getDMById(req.params.user_id, req.params.id, function(err, result) {
      if (err) {
        var status = err.status? err.status: 500
        helpers.sendJsonResponse(res, status, err)
        return
      } else {
        log.info(util.inspect(result))
        helpers.sendJsonResponse(res, result.status, result.content)
        return
      }
    })
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
        var status = err.status? err.status: 500
        helpers.sendJsonResponse(res, status, err)
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
  //update session object with last msg id and save new msgText object
  if (req.params.user_id && req.params.id && req.body.ip && req.body.msgText) {
    var user_id = req.params.user_id,
        id = req.params.id,
        ip = req.body.ip,
        msgText = req.body.msgText

    dmCommon.resumeDMById(user_id, id, ip, msgText, function(err, result) {
      if (err) {
        var status = err.status? err.status: 500
        helpers.sendJsonResponse(res, status, err)
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

var removeDMByMsgId = function(req, res) {
  //delete msgobj using its id and update sessionobj with previous last msgId
  dmCommon.removeDMByMsgId(req.params.user_id, req.params.id, req.params.msg_id, function(err, result) {
    if (err) {
      var status = err.status? err.status: 500
      helpers.sendJsonResponse(res, status, err)
      return
    } else {
      log.info(util.inspect(result))
      helpers.sendJsonResponse(res, result.status, result.content)
      return
    }
  })
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
