const os = require('os');
const path = require('path');

const config = {
  ROOT_PATH: _rootPath()
};

// app port in host
config['PORT'] = process.env.PORT || 8080;

// MongoDB
config['MONGOURI'] = process.env.MONGOURI;

// Redis (for replica management)
config['REDISURI'] = process.env.REDISURI;

// auth secret
config['JWT_SECRET'] = process.env.JWT_SECRET || _genJwtSecret();

// Instance Id in replica
config['INSTANCE_ID'] = process.env.INSTANCE_ID || _genInstanceId();

// Max available disk space (in bytes)
config['MAX_DISK_STORAGE'] = process.env.MAX_DISK_STORAGE || _maxDiskStorage();

// Local storage path (must be writable)
config['LOCAL_STORAGE_PATH'] = process.env.LOCAL_STORAGE_PATH || `${_rootPath()}/local_storage`;

config['DEBUG'] = '1'; //process.env.DEBUG;

module.exports = config;


/**
 * Errors
 */
const ERRORS = {
  'SERVER_ERROR': {
    httpStatus: 500,
    message: 'Uprocessed server error'
  },
  'MISSING_UPLOAD_FILE': {
    httpStatus: 500,
    message: "We not found inbound file"
  },
  'INVALID_REQUEST': {
    // httpStatus: 400,
    message: "Invalid request"
  },
  'INVALID_UPLOAD_REQUEST': {
    // httpStatus: 400,
    message: "Invalid upload request"
  },
  'INVALID_DOWNLOAD_REQUEST': {
    // httpStatus: 400,
    message: "Invalid upload request"
  },
  'NO_FREE_SPACE': {
    httpStatus: 500,
    message: 'Here is no free space'
  },
  'VERSION_UPLOADED_EARLY': {
    httpStatus: 409,
    message: 'This version has been uploaded'
  },
  'VERSION_NOT_UPLOADED': {
    httpStatus: 409,
    message: 'This version not uploaded yet'
  },
};
Object.keys(ERRORS).map(key => ERRORS[key].code = key);

module.exports.ERRORS = ERRORS;


// private


function _rootPath() {
  return path.join(path.resolve(__dirname, '..'));
}

function _genJwtSecret() {
  return 'b647ef74c4edbfbdc07f5c635011db292e54e0e245e50f0526a351442562610f920b03684222cf62d42348d5e6b295baade4c47127bbfeb29bb38a8996a0b0b2'
}

function _genInstanceId() {
  return [os.hostname().toLowerCase(), config['PORT']].join(':') // dummy
}

function _maxDiskStorage() {
  return 1024 * 1024 * 50 // 50 MB in SI (not ISU)
}
