var post_model = require('../models/postSchema.js');
var async = require('async');
var master = require('./master.js');
var notificationModel = require('../models/notificationSchema.js');
var log = require('../../config/logging')()

//update reply to post
var setreply = function(req, res) {

    var post_type 		= req.body.post_type;
    var reply_user_id 	= req.body.reply_user_id;
    var reply_msg 		= req.body.reply_msg;
    var post_id 		= req.body.post_id;
	var privacy_setting = req.body.privacy_setting; 

    var mentionusers = new Array();
    var hashtags = new Array();
    var replyOn = "";

    var regexat = /@([^\s]+)/g;
    var regexhash = /#([^\s]+)/g;

    req.checkBody('post_type', 'post type').notEmpty();
    req.checkBody('reply_user_id', 'reply user id').notEmpty();
    req.checkBody('reply_msg', 'reply msg').notEmpty();
    req.checkBody('post_id', 'post id').notEmpty();
    req.checkBody('privacy_setting', 'Privacy Setting').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        log.warn('There have been validation errors: \n' + util.inspect(errors));
        res.status('400').json('There have been validation errors: ' + util.inspect(errors));
        return;
    }

    while (match_at = regexat.exec(reply_msg)) {
        mentionusers.push(match_at[1]);
    }

    while (match_hash = regexhash.exec(reply_msg)) {
        hashtags.push(match_hash[1]);
    }

    // while (match_url = regexat.exec(post_description)) {
    //     urls.push(match_url[1]);
    // }

    log.info('Mention Users : ', mentionusers);
    log.info('Hash Tags : ', hashtags);

    //blank validation
    if (post_type == 1) { //post

        replyOn = "Post";

        collectionName = post_model.post;

        var post_reply = new post_model.reply({
            post_id: post_id,
            reply_user_id: reply_user_id,
            reply_msg: reply_msg,
			privacy_setting:privacy_setting
        });

    } else if (post_type == 2) { //retweet

        replyOn = "Retweet";

        collectionName = post_model.retweet_quote;

        var post_reply = new post_model.reply({
            retweet_quote_id: post_id,
            reply_user_id: reply_user_id,
            reply_msg: reply_msg,
			privacy_setting:privacy_setting
        });

    } else if (post_type == 3) { //reply

        replyOn = "Reply";

        collectionName = post_model.reply;

        var post_reply = new post_model.reply({
            reply_id: post_id,
            reply_user_id: reply_user_id,
            reply_msg: reply_msg,
			privacy_setting:privacy_setting
        });

    }

    collectionName
	.find({ _id: post_id })
	.lean()
	.exec(function(err, replyResult) {

		if (err) {

			log.error(err)
			res.send(err);
			return;
		}

		if (replyResult.length !== 0) {

			post_reply
			.save(function(err) {

				if (err) {

					log.error(err)
					res.send(err);
					return;
				}

				master.hashtagMention(3, post_reply, mentionusers, hashtags, function(err, result) {

					if (err) {

						log.error(err)
						res.send(err);
						return;
					}

					res.json({
						message: 'Reply Inserted'
					});

					log.info('Reply Inserted');

				});

				master.getusername(reply_user_id, function(err, result) {

					log.info(result);

					if (err) {

						log.error(err)
						res.send(err);
						return;
					}

					if (result !== 'No user found') {

						if (mentionusers != "") {
							
							var i = -1;
							var notification_message = result + ' Has Replied on your ' + replyOn;
							var notification = new notificationModel.notification({

								notification_message: notification_message,
								notification_user: mentionusers,
								reply_id: post_reply._id,
								usrname: result[0]

							});

							notification.save(function(err) {

								if (err) {

									log.error(err)
									res.send(err);
									return;
								}

								log.info('Notification Saved');

							})
						}
					}

				})

			});
					
		} else {

                log.info('No post found');
                res.send('No post found');

		}

	});

};

// var getreply = function(req, res){

// var post_id = req.params.post_id;
// var reply_user_id = req.params.reply_user_id;

// post_model.reply 
// .find({post_id : post_id})
// .populate('user_id post_id')
// .sort({created_at : -1})
// .exec(function(err, result){
// if (err) {
// res.send(err)
// };
// log.info(result);

// res.json({
// reply: result
// })

// })

// }

var getReply = function(req, res) {

    var type = req.params.type;
    var id = req.params.id;

    if (type == 1 || type == '1') {

		var post_id = id;

        post_model.reply
		.find({ post_id: post_id })
		.populate('post_id')
		.lean()
		.exec(function(err, postReplys) {

			if (err) {

				log.error(err)
				res.send(err);
				return;
			}

			if (postReplys == "" || postReplys == null || postReplys == undefined) {
				res.send('No Reply on this Post');
				return;
			}

			async.each(postReplys, function(singlepostReplys, callback) {

				var reply_id = singlepostReplys._id

				post_model.reply
				.count({ reply_id: reply_id })
				.lean()
				.exec(function(err, result) {

					singlepostReplys.count = result;
					callback();

				})

			}, function(err) {

				res.send(postReplys);

			})

		})
    }

    if(type == 2 || type == '2'){
	
        var retweet_quote_id = id;
        log.info(retweet_quote_id);

        post_model.reply
		.find({ retweet_quote_id: retweet_quote_id })
		.populate('retweet_quote')
		.lean()
		.exec(function(err, retweetReplys) {

			log.info(retweetReplys);

			if (err) {

				log.error(err)
				res.send(err);
				return;
			}

			if (retweetReplys == "" || retweetReplys == null || retweetReplys == undefined) {
				res.send('No Reply on this Retweet');
				return;
			}

			async.each(retweetReplys, function(singleretweetReplys, callback) {

				var reply_id = singleretweetReplys._id

				post_model.reply
				.count({ reply_id: reply_id })
				.lean()
				.exec(function(err, result) {

					singleretweetReplys.count = result;
					callback();

				})

			}, function(err) {

				res.send(retweetReplys);

			})

		})
    }

    if (type == 3 || type == '3') {
        var reply_id = id;

        post_model.reply
            .find({
                reply_id: reply_id
            })
            .populate('reply')
            .lean()
            .exec(function(err, replyReplys) {

                if (err) {

                    log.error(err)
                    res.send(err);
                    return;
                }

                if (replyReplys == "" || replyReplys == null || replyReplys == undefined) {
                    res.send('No Reply on this Reply');
                    return;
                }

                async.each(replyReplys, function(singlereplyReplys, callback) {

                    var reply_id = singlereplyReplys._id

                    post_model.reply
                        .count({
                            reply_id: reply_id
                        })
                        .lean()
                        .exec(function(err, result) {

                            singlereplyReplys.count = result;
                            callback();

                        })

                }, function(err) {

                    res.send(replyReplys);

                })

            })
    }

}

var deletereply = function(req, res) {

    var reply_id = req.body.reply_id;
    var reply_user_id = req.body.reply_user_id;

    req.checkBody('reply_id', 'reply_id').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        log.warn('There have been validation errors: \n' + util.inspect(errors));
        res.status('400').json('There have been validation errors: ' + util.inspect(errors));
        return;
    }

    post_model.reply
        .findOneAndRemove({
            _id: reply_id,
            reply_user_id: reply_user_id
        })
        .exec(function(err, result) {

            if (err) {

                log.error(err)
                res.send(err);
                return;
            }

            if (result !== null) {

                log.info('Reply Deleted');

                res.json({
                    message: 'Reply Deleted'
                });
            } else {

                log.info('No Reply Found');

                res.json({
                    message: 'No Reply Found'
                });
            }

        });

};

module.exports = ({
    setreply: setreply,
    //getreply : getreply,
    deletereply: deletereply,
    getReply: getReply
})