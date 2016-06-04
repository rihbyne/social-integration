var notificationModel = require('../models/notificationSchema.js')

var getNotification = function (req, res) {
  var username = req.params.username
  notificationModel.notification
    .find({notification_user: username}, {notification_user: 0})
    .populate([{path: 'post_id', model: 'post'}, {path: 'reply_id', model: 'reply'}, {path: 'retweet_id', model: 'retweet'}, {path: 'retweet_quote_id', model: 'retweet_quote'}])
    .sort({'created_at': -1})
    .exec(function (err, result) {
      console.log(result)
      res.send(result)
    })
}

module.exports = {
  getNotification: getNotification

}
