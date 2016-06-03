// Packages
var crypto  = require('crypto');
var token   = require('token');
var _ = require('lodash')

// Algorithm AND Key
var algorithm = 'sha512';
var key       = process.env.TOKEN_KEY;

token.defaults.secret= process.env.TOKEN_SECRET;
token.defaults.timeStep= 1 * 60 * 60; // 1h in seconds form

var log = require('./logging')()

// Random Value Generator Function
module.exports.hashIt = function (data){
    
    var sha = crypto.createHash('sha1');
    sha.update(data+"",'ascii');
    return sha.digest('hex');
};

module.exports.generate = function(data) {
    return token.generate(data.toString());
};

module.exports.createKeyPair = function(text, cb) {
  
  var hash;
  var hmac = crypto.createHmac(algorithm, key);
  // readout format:
  hmac.setEncoding('hex');
  //or also commonly: hmac.setEncoding('base64');

  // callback is attached as listener to stream's finish event:
  hmac.end(text, function () {
    hash = hmac.read();
    //...do something with the hash...
    // log.info(hash);
    
    cb(hash);
  });
  

};

module.exports.encryptMessage = function(text, k, cb) {
    
    var hash;
    var hmac = crypto.createHmac(algorithm, k);
    // readout format:
    hmac.setEncoding('hex');
    //or also commonly: hmac.setEncoding('base64');
    // callback is attached as listener to stream's finish event:
    hmac.end(text, function () {
        hash = hmac.read();
        //...do something with the hash...
        console.log('signture');
        console.log(hash);
        cb(hash);
    });

};

module.exports.validateSignature = function(text, signature, privateKey, cb) {
  
    this.encryptMessage(text, privateKey, function(hash) {
        
        if (signature === hash)
        {
            log.info('Signature is Valid');
            cb(true);
        }
        else
        {
            log.info( signature + ' !== \n' + hash);
            cb(false);
        }
        
    });
  
};

module.exports.random = function (howMany, chars) {
    chars = chars 
        || "0123456789";
    var rnd = crypto.randomBytes(howMany)
        , value = new Array(howMany)
        , len = chars.length;

    for (var i = 0; i < howMany; i++) {
        value[i] = chars[rnd[i] % len]
    };

    return value.join('');
}

module.exports.generateSignText = function(multiargs) {
  var joiner = ""
  _.map(multiargs, function(n) {
    joiner+= _.indexOf(multiargs, n) === 0? (
      Object.keys(n)[0]+"="+n[Object.keys(n)[0]]
    ): (
      "&"+Object.keys(n)[0]+"="+n[Object.keys(n)[0]]
    )
  })

  log.info("dynamic sign text => " + joiner)

  return joiner
}

module.exports.token = token;
