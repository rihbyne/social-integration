var sendJsonResponse = function(res, status, content) {
  res.contentType('application/json')
  res.status(status)
  res.send(content)
}

module.exports = {
  sendJsonResponse: sendJsonResponse
}
