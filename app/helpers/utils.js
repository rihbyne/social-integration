var log = require('../../config/logging')()

var sendJsonResponse = function(res, status, content) {
  res.contentType('application/json')
  res.status(status)
  res.send(content)
}

var validateParameter = function (parameter, name) {
  if (parameter === undefined || parameter.length <= 0) {
    log.error(name + ' Is Missing')
    return false
  }

  return true
}

var assembleImgURL = function(postId, static_file) {
  var makeURL = process.env.PROTOCOL + '://' +
                process.env.S3_FALLBACK_HOST + ':' +
                process.env.S3_FALLBACK_PORT +
                '/api/social/post/' + postId + '/media/' +
                static_file
  return makeURL
}

if (typeof Object.create !== 'function') {
  Object.create = function(o) {
    var F = function () {}
    F.prototype = o
    return new F()
  }
}

var isoDateValidate = function(dateStr) {
  var isvalid = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/.test(dateStr)

  return isvalid
}
module.exports = {
  sendJsonResponse: sendJsonResponse,
  isoDateValidate: isoDateValidate,
  validateParameter: validateParameter,
  assembleImgURL: assembleImgURL
}
