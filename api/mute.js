var user_final_followers_schema = require('../app/models/model.final_followers.js');

var setmuteuser = function(req, res) {

    var userId = req.body.userId;
    var followingId = req.body.followingId;

    //Validation remaining

    user_final_followers_schema
        .find({
            $and: [{
                user_id: userId
            }, {
                following_id: followingId
            }]
        })
        .select('mute')
        .exec(function(err, muteresult) {
            if (err)
                res.send(err)
            	
            	console.info(muteresult);

            	var blockStatus = (muteresult[0].block == false) ? true : false;

            	user_final_followers_schema
            	.update({_id : muteresult[0]._id}, {block: blockStatus})
            	.exec(function(err, result){

            		 if (err)
		                res.send(err)
		            	
		            	console.info(result);

            	})


        });

}

var getmuteuser = function(req, res){

	var userId = req.params.userId;
    var blockStatus = req.params.blockStatus;

    //validation Remaining

    user_final_followers_schema
    .find({$and: [{user_id: userId}, {block: 'true'}]})
    .select('following_id')
    .exec(function(err, result){
    	if (err) {
    		res.send(err)
    	};
    	console.info(result);
    	res.json({
    		countOfBlockUsers: result.length,
    		listOfBlockUsers: result
    	})
    })

}

module.exports = ({
	setmuteuser : setmuteuser,
	getmuteuser : getmuteuser
});
