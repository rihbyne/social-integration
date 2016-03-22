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
    console.log(post_title);
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

//Get all post
module.exports.getuserposts = function(req, res) {			 // get a post 
	console.log('Show all posts for single user');
    var user = req.params.post_user;
    // find posts of user and check for errors
    post_model.post.find({posted_by:user}).exec(function(err, userposts) {
        if (err)
            res.send(err);

        res.json({ posts: userposts});
    });
    
};

//Get single post of user
module.exports.getuserpost = function(req, res) {			 // get a post 
	console.log('Show all posts for single user');
    var user = req.params.post_user;
    var post_id = req.params.post_id;
    // find posts of user and check for errors
    post_model.post.find({posted_by:user}).exec(function(err, userposts) {
        if (err)
            res.send(err);

        res.json({ posts: userposts});
    });
    
};

//Get all post
module.exports.gethashtag = function(req, res) {			 // get a post 
	console.log('Show all HashTag');
   
    // save the bear and check for errors
    post_model.post_hashtag.find(function(err, allhashtag) {
        if (err)
            res.send(err);

        res.json({ posts: allhashtag});
    });
    
};

//Set post
module.exports.setpost = function(req, res) {				// create a post 
	console.log('Add post');

	var posted_by 		 = req.body.posted_by; 					// get the post name (comes from the request)
	var post_title 		 = req.body.post_title; 					// get the post name (comes from the request)
	var post_description = req.body.post_description; 				// get the post name (comes from the request)

	var mentionusers = new Array();
	var hashtags 	 = new Array();

	var regexat = /@([^\s]+)/g;
	var regexhash = /#([^\s]+)/g;

	while (match_at = regexat.exec(post_description)) {
	  mentionusers.push(match_at[1]);
	}

	while (match_hash = regexhash.exec(post_description)) {
	  hashtags.push(match_hash[1]);
	}

	console.log('Mention Users : ',mentionusers);
	console.log('Hash Tags : ',hashtags); 
    	
	var post = new post_model.post({
		posted_by 		 : posted_by,
		post_title	     : post_title,        
	    post_description : post_description,      
	    created_at	     : Date.now(),        
	    last_update	 	 : Date.now() 
	});      			// create a new instance of the post model

	// save the post and check for errors
	post.save(function(err) {
	    if (err)
	        res.send(err);

	    res.json({ message: 'Post created!' }); 
	});

	if(typeof mentionusers != "undefined" && mentionusers != null && mentionusers.length > 0){

		var post_mention = new post_model.post_mention({ 
			post_id			: post.post_id,
			posted_by		: posted_by,
		    mention_users	: mentionusers			     	
		});

		post_mention.save(function(err) {
		    if (err)
		        res.send(err);

		    // res.json({ message: 'Post and Mention users created!' });
		});


	};

	if(typeof hashtags != "undefined" && hashtags != null && hashtags.length > 0){

		var post_hash = new post_model.post_hashtag({
			    hashtag :     hashtags     // posted by 
		});

		var post_hashtag_links = new post_model.post_hashtag_links({ 
			post_id			: post._id,
			post_hashtag		: post_hash._id    	
		});

		post_hash.save(function(err) {
		    if (err)
		        res.send(err);

		    // res.json({ message: 'Post and hash tag created!' });
		});

		post_hashtag_links.save(function(err) {
		    if (err)
		        res.send(err);

		    // res.json({ message: 'Post and hash tag created!' });
		});

	};
	
};