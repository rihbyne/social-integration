var log = require('../../config/logging')();
var postModel = require('../models/postSchema.js'); // Including postModel File
var util = require('util');
var master = require('./master.js');

var updatePrivacy = function(req, res) {

    log.info('update privacy api hitted');

    var userId = req.body.userid;
    var privacy = parseInt(req.body.privacy);
    var postType = parseInt(req.body.post_type);
    var postId = req.body.post_id;

    console.info('userId : ', userId);
    console.info('privacy : ', privacy);
    console.info('postType : ', postType);
    console.info('postId : ', postId);

    req.checkBody('userid', 'User id is mandatory').notEmpty();
    req.checkBody('privacy', 'privacy is mandatory').notEmpty();
    req.checkBody('post_type', 'post type is mandatory').notEmpty();
    req.checkBody('post_id', 'postId is mandatory').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        log.warn('There have been validation errors: \n' + util.inspect(errors));
        res.status('400').json('There have been validation errors: ' + util.inspect(errors));
        return;
    }

    var collectionName, query;

    if (postType === 1) {

        collectionName = postModel.post;
        query = {
            _id: postId,
            posted_by: userId
        };

    } else if (postType === 2) {

        collectionName = postModel.retweet_quote;
        query = {
            _id: postId,
            ret_user_id: userId
        };

    } else if (postType === 3) {

        collectionName = postModel.reply;
        query = {
            _id: postId,
            reply_user_id: userId
        };
    }

    master.isValidUser(collectionName, query, function(err, validResult) {

        if (err) {
            log.error(validResult);
            res.send(validResult);
            return;
        }

        console.info(validResult);

        var update = {
            privacy_setting: privacy
        };

        collectionName
            .findOneAndUpdate(query, update, function(err, updateResult) {

                if (err) {
                    log.error(validResult);
                    res.send(validResult);
                    return;
                };

                res.json('Privacy setting Updated');

            });

    });

};


module.exports = ({
    updatePrivacy: updatePrivacy
});
