// multimedia route module
var express = require('express')
var router = express.Router()
var multer = require('multer')

var ctrlMediaUpload = require('../controllers/mediaUpload')
var upload = multer(ctrlMediaUpload.fallbackImageConfig)

//router.get('/sign-s3', ctrlMediaUpload.getS3SignedUrl)
router.post('/fallback-uploads', upload.single('img_attachment'), ctrlMediaUpload.fallbackUpload)
router.get('/post/:id/media/:static_file', ctrlMediaUpload.returnStaticContent)

module.exports = router
