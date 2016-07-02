// multimedia schema
var mongoose = require('mongoose')
var _ require('lodash')

var util = require('util')
var log = require('../../config/logging')()

var imageUploadSchema = new mongoose.Schema({
  image_path: {type: String, required: true},
  file_name: {type: String, required: true},
  upload_time: {type: Date, default: Date.now}
});

var videoUploadSchema = new mongoose.Schema({
  video_path: {type: String, required: true},
  file_name: {type: String, required: true},
  upload_time: {type: Date, default: Date.now}
});

mongoose.model('ImageUploadMedia', imageUploadSchema, 'ImageUploads')
mongoose.model('VideoUploadMedia', imageUploadSchema, 'VideoUploads')
