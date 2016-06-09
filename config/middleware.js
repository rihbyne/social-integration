var meta = require('util')

var crypt = require('./crypt')
var helpers = require('../app/helpers/utils');
var log = require('./logging')()

var ip = process.env.PROTOCOL+'://'+ process.env.STWALLET_IP + ':'+ process.env.STWALLET_PORT;

var paramsForCrypt = function(func, req, res) {
  var flexArgs = {
    t1: function(req, res) {
      return [{user_id: req.body.user_id}, {logged_id: req.body.logged_id}]
    },
    t2: function(req, res) {
      return [{user_id: req.body.user_id}, {logged_id: req.body.logged_id}]
    },
    htl: function(req, res) {
      return [{user_id: req.body.userid}]
    },
    mu: function(req, res) {
      return [{mention_user: req.params.mention_user}]
    },
    htag: function(req, res) {
      return [{hastag: req.params.hashtag}]
    },
    htagcount: function(req, res) {
      return [{hastag: req.params.hashtag}]
    },
    rwt: function(req, res) {
      return [{post_id: req.body.post_id}, {ret_user_id: req.body.ret_user_id}]
    },
    rwtp: function(req, res) {
      return [{post_type: req.params.post_id}, {post_id: req.params.post_id}]
    },
    rwtd: function(req, res) {
      return [{retweet_quote_id: req.body.retweet_quote_id}, {ret_user_id: req.body.ret_user_id}]
    },
    defaults: function(req, res) {
      return null
    }
  }
  var paramAttacher = (flexArgs[func] || flexArgs['defaults'])(req, res)
  paramAttacher.push({publicKey:req.body.publicKey || req.query.publicKey})

  return paramAttacher
}

//var checkPubSignKey = function(req, res, next) {
//  var pubKey = req.query.publicKey || req.body.publicKey;
//  log.info('public key middleware check '+ pubKey);
//
//  var signature = req.query.signature || req.body.signature;
//  log.info('signature middleware check '+ signature);
//
//  if(!helpers.validateParameter(pubKey, 'Public Key')) {
//    log.warn('public key error '+ pubKey);
//    helpers.sendJsonResponse(res, 403, {failed:"Mandatory field not found"});
//    return;
//  } else if (!helpers.validateParameter(signature, 'Signature')) {
//    log.warn('signature absent '+ signature);
//    helpers.sendJsonResponse(res, 403, {failed:"Mandatory field not found"});
//   return;
//  } else {
//    next();
//  }
//}

var secureAPI = function() {
  var func = Array.prototype.slice.apply(arguments)[0]

  return function(req, res, next) {
    var publicKey = req.query.publicKey || req.body.publicKey
    log.info('public key middleware check '+ publicKey)

    var signature = req.query.signature || req.body.signature
    log.info('signature middleware check '+ signature)

    var query = {publicKey:publicKey,token:true};

    if(!helpers.validateParameter(publicKey, 'Public Key')) {
      log.warn('public key error '+ publicKey);
      helpers.sendJsonResponse(res, 403, {failed:"Mandatory field not found"});
      return;
    } else if (!helpers.validateParameter(signature, 'Signature')) {
      log.warn('signature absent '+ signature);
      helpers.sendJsonResponse(res, 403, {failed:"Mandatory field not found"});
      return;
    } else {
      request.post({
        url: ip+'/api/getPvtKey',
        body: query,
        json: true,
        headers: {"content-type": "application/json"}
      },function (err, httpResponse, body) {
        if (err) {
          log.error('Curl request Failed for register api: \t'+ meta.inspect(err))
          helpers.sendJsonResponse(res, 500, {failed:"wallet gateway down"})
          return
        }

		    if(body.errCode == -1) {
			    var privateKey = body.errMsg;
          var varArgs = paramsForCrypt(func, req, res)
			    var text = crypt.generateSignText(varArgs)

			    crypt.validateSignature(text, signature, privateKey, function(isValid) {
            // Signature Not Matched
				    if (!isValid) {
              helpers.sendJsonResponse(res, 403, {failed:"Invalid Signature"})
					    log.warn('Invalid Signature');
					    return
				    } else {
              next()
            }
          })
        }
      })
    }
  }
}

var secure = function() {
  var args = Array.prototype.slice.apply(arguments)

  return function(req, res, next) {
    log.info(util.inspect(args))
    next()
  }
}

module.exports = {
  //checkPubSignKey: checkPubSignKey,
  secureAPI: secureAPI,
  secure: secure
};
