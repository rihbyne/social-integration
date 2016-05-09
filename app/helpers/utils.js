var sendJsonResponse = function(res, status, content) {
  res.contentType('application/json')
  res.status(status)
  res.send(content)
}

var isoDateValidate = function(dateStr) {
  var isvalid = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/.test(dateStr)

  return isvalid
}
module.exports = {
  sendJsonResponse: sendJsonResponse,
  isoDateValidate: isoDateValidate
}
