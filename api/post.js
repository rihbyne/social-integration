var post_model = require('../model/post_model.js');
var express = require('express');
var router 	= express.Router();             			 // get an instance of the express Router

//Get all post
module.exports.getpost = function(req, res) {			 // get a post 
	console.log('Show all post');
   
    // save the bear and check for errors
    post_model.post.find(function(err, allpost) {
        if (err)
            res.send(err);

        res.json({ posts: allpost});
    });
    
};

//Get single post
module.exports.getsinglepost = function(req, res) {			 // get a post 
	console.log('Show single post');
    var post_title = req.params.post_title;
    // get the post and check for errors
    post_model.post.findOne({post_title: post_title}).exec(function(err, singlepost) {
        if (err)
            res.send(err);
        if (singlepost) {
        	res.json({ posts: singlepost});
        }
        else{
        	res.json('No Post Found')
        }
        
    });
    
};

//Set post
module.exports.setpost = function(req, res) {				// create a post 
	console.log('Add post');

	var posted_by 		 = req.body.posted_by; 					// get the post name (comes from the request)
	var post_title 		 = req.body.post_title; 					// get the post name (comes from the request)
	var post_description = req.body.post_description; 				// get the post name (comes from the request)

	var mentionusers = [];
	var hashtags 	 = [];

	var regexat = /@([^\s]+)/g;
	var regexhash = /#([^\s]+)/g;

	while (match_at = regexat.exec(post_description)) {
	  mentionusers.push(match_at[1]);
	}

	while (match_hash = regexhash.exec(post_description)) {
	  hashtags.push(match_hash[1]);
	}

	console.log(mentionusers);
	console.log(hashtags); 

	post_model.post.count({}, function( err, count){
    	
    	var post = new post_model.post({
    		post_id 		 : count++,
			posted_by 		 : posted_by,
			post_title	     : post_title,        
		    post_description : post_description,      
		    created_at	     : Date.now(),        
		    last_update	 	 : Date.now() 
		});      			// create a new instance of the post model

		if (mentionusers) {

			var post_mention = new post_model.post_mention({ 
				post_id			: post.post_id,
				posted_by		: posted_by,
			    mention_users	: mentionusers			     	
			});

			post_mention.save(function(err) {
			    if (err)
			        res.send(err);

			    res.json({ message: 'Post and Mention users created!' });
			});

		};

		if (hashtags) {

			var post_hash = new post_model.post_hash({
				if (err) 
					res.send(err);
				res.json({message: ''})
			})
		};
    	// save the post and check for errors
		post.save(function(err) {
		    if (err)
		        res.send(err);

		    res.json({ message: 'Post created!' }); 
		});

	});

	
};