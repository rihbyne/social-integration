// all types of multimedia controller module
var mongoose = require('mongoose')
var multer = require('multer')
var mime = require('mime')
var Promise = require('bluebird')
var uuid = require('node-uuid')
var util = require('util')
var aws = require('aws-sdk')
var async = require('async')
var _ = require('lodash')
var fs = require('fs')

var log = require('../../config/logging')()
var helpers = require('../helpers/utils')

var ImageUploadMedia = mongoose.model('ImageUploadMedia')
var VideoUploadMedia = mongoose.model('VideoUploadMedia')

var basicImageConfig = (function() {
  var that = {
    baseDir: '/tmp',
    storage: multer.diskStorage({
      destination: function(req, file, cb) {
        cb(null, that.baseDir)
      },
      filename: function(req, file, cb) {
        var processedFileName = file.originalname
        cb(null, processedFileName)
      }
    }),
    limits: {
      fileSize: 1000000
    },
    fileFilter: function(req, file, cb) {
      log.info('== file filter option ==')
      cb(null, true)
    }
  }
  return that
}())

var multerImageConfig = Object.create(basicImageConfig)
multerImageConfig.baseDir = process.env.MULTER_UPLOAD_DEST
multerImageConfig.storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, multerImageConfig.baseDir)
  },
  filename: function(req, file, cb) {
    log.info(util.inspect(file))
    var processedFileName = 'multer' + '-' + file.originalname
    cb(null, processedFileName)
  }
})

log.info(util.inspect(multerImageConfig))

var fallbackImageConfig = Object.create(basicImageConfig)
fallbackImageConfig.baseDir = process.env.S3_FALLBACK_MEDIA_DIR
fallbackImageConfig.storage= multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, fallbackImageConfig.baseDir)
  },
  filename: function(req, file, cb) {
    log.info(util.inspect(file))
    var processedFileName = file.fieldname + '-' + uuid.v1() +
                            '.' + mime.extension(mime.lookup(file.originalname))
    cb(null, processedFileName)
  }
})

log.info(util.inspect(fallbackImageConfig))

var processMedia = function(req, mediacb) {
  //validateFileUploads()
  //processUpload()
  //---fallbackUpload
  //getImgObjectId()

  processUpload(req, function(processErr, processOK) {
    if (processErr) {
      mediacb(processErr)
    } else {
      log.info('call returned to set post function')
      mediacb(null, processOK)
    }
  })
}

var processUpload = function(req, processcb) {
  //This function gets signed url using aws-sdk module for the client app to upload media
  //directly to S3.
  log.info('processing upload')
  log.info(util.inspect(req.file))

  var s3 = new aws.S3()
  var fileName = req.file.filename
  var fileType = req.file.mimetype
  var filePath = req.file.path

  var s3Params = {
    Bucket: process.env.S3_BUCKET,
    Body: fs.createReadStream(filePath),
    Key: fileName,
    Expires: 60,
    ContentEncoding: req.file.encoding,
    ContentType: fileType,
    ACL: 'public-read'
  }

  s3.putObject(s3Params, function(err, res) {
    if (err) {
      //if there is err, then check for empty S3_BUCKET, if true, fallback to native fs upload
      log.info('aws error occured. preparing fallback upload')
      log.error(util.inspect(err))
      var assembleFallbackURL = process.env.PROTOCOL+ "://" + process.env.S3_FALLBACK_HOST + ':'
                              + process.env.S3_FALLBACK_PORT + '/api/social/fallback-uploads'

      var awsFailedReport = {
        status: 500,
        content: err
      }

      var formData = {
        aws_failed_report: JSON.stringify(awsFailedReport),
        img_attachment: fs.createReadStream(req.file.path),
        original_filename: req.file.originalname
      }

      request.post({
        url: assembleFallbackURL,
        formData: formData
      }, function(err, httpRes, body) {
        if (err) {
          log.error('fallback upload failed', util.inspect(err))
          var fallbackErrReport = {
            status: 500,
            content: err
          }
          processcb(err)
        } else {
          var parsedData = JSON.parse(body)
          log.info('fallback response', util.inspect(parsedData))
          var save_metadata = {
            original_filename: parsedData.original_filename,
            processed_filename: parsedData.processed_filename,
            abs_path: parsedData.abs_path,
            mimetype: parsedData.mimetype,
            size: parsedData.size
          }

          //call getImgObjectId() and return the objectid to post collection
          getImgObjectId(save_metadata, function(saveErr, imgMetaId) {
            if (saveErr) {
              processcb({
                status: 500,
                content: saveErr
              })
            } else {
              parsedData.imgObjectId = imgMetaId
              delete parsedData.abs_path
              processcb(null, {
                status: 201,
                content: parsedData
              })
            }
          })
        }
      })
    } else {
      //call getImgObjectId() and return the objectid to post collection
      var msg_ok = 'aws file upload succeeded'
      log.info(msg_ok)
      processcb(null, {success: msg_ok})
    }
  })
}

var fallbackUpload = function(req, res) {
  //This function only exist as a fallback alternative to official
  //static storage solution
  log.info('fallback to known server to upload images')
  var aws_failed_report = req.body.aws_failed_report
  var fallback_report = {
    upload_mechanism: 'fallback',
    aws_report: JSON.parse(aws_failed_report),
    original_filename: req.body.original_filename,
    processed_filename: req.file.filename,
    abs_path: req.file.path,
    mimetype: req.file.mimetype,
    size: req.file.size
  }
  helpers.sendJsonResponse(res, 200, fallback_report)
}

var getImgObjectId = function(metadata, cb) {
  // returns Img mongoose Id to the caller
  var imgsave = new ImageUploadMedia({
    original_filename: metadata.original_filename,
    processed_filename: metadata.processed_filename,
    abs_path: metadata.abs_path,
    mimetype: metadata.mimetype,
    size: metadata.size
  })

  imgsave.save(function(err, metadataObject) {
    if (err) {
      log.error(util.inspect(err))
      cb(err)
    } else {
      cb(null, metadataObject._id)
    }
  })
}

var getVidObjectId = function() {

}

var returnStaticContent = function(req, res) {
  //retrieve the static content

}

module.exports = {
  processMedia: processMedia,
  basicImageConfig: basicImageConfig,
  multerImageConfig: multerImageConfig,
  fallbackImageConfig: fallbackImageConfig,
  getImgObjectId: getImgObjectId,
  getVidObjectId: getVidObjectId,
  fallbackUpload: fallbackUpload,
  returnStaticContent: returnStaticContent
}
