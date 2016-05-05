var notificationModel = require('../models/notificationSchema.js');

var getNotification = function (req, res){

	var username = req.params.username;
	notificationModel.notification
	.find({notification_user:username},{notification_user:0})
	.populate({path:'post_id', model:'post'})
	.exec(function(err, result){
	
		console.log(result);
		res.send(result);
		
	})

}

module.exports = {
	
	getNotification :getNotification

}