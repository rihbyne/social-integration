// multimedia schema
var mongoose = require('mongoose')
var _ = require('lodash')

var util = require('util')
var log = require('../../config/logging')()

var imageUploadSchema = new mongoose.Schema({
  original_filename: {type: String, required: true},
  processed_filename: {type: String, required: true},
  abs_path: {type: String, required: true},
  mimetype: {type: String, required: true},
  size: {type: String, required: true},
  upload_time: {type: Date, default: Date.now}
});

var videoUploadSchema = new mongoose.Schema({
  orginal_file_name: {type: String, required: true},
  processed_file_name: {type: String, required: true},
  mime_type: {type: String, required: true},
  size: {type: String, required: true},
  upload_time: {type: Date, default: Date.now}
});

mongoose.model('ImageUploadMedia', imageUploadSchema, 'ImageUploads')
mongoose.model('VideoUploadMedia', imageUploadSchema, 'VideoUploads')
