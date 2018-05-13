const fs = require('fs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const getFolderSize = require('get-folder-size');
const contentRange = require('content-range');

const config = require('./config');

const JWT_SECRET = config.JWT_SECRET;
const JWT_DEFAULT_OPTIONS = {
  issuer: 'devchallenge:12:backend:r1',
  algorithm: 'HS256'
};
const INSTANCE_ID = config.INSTANCE_ID;
const HUNDRED_DAYS = 60 * 60 * 24 * 100; // seconds * minutes * hours * days


/**
 *
 * @param responseContext
 * @param errorContext
 */
const responseError = (responseContext, errorContext) => {
  const response = {
    error_code: errorContext.code
  };
  if (errorContext.hasOwnProperty('message')) {
    response['details'] = errorContext.message;
  }
  if (errorContext.hasOwnProperty('httpStatus')) {
    responseContext.status(errorContext.httpStatus);
  } else {
    responseContext.status(400);
  }
  return responseContext.send(response)
};
module.exports.responseError = responseError;

const between = (x, min, max) => {
  return x >= min && x <= max;
}
module.exports.between = between;

/**
 * Move File
 *
 * @param from
 * @param to
 * @returns {Promise<any>}
 */
const moveFile = (from, to) => {
  const source = fs.createReadStream(from);
  const dest = fs.createWriteStream(to);

  return new Promise((resolve, reject) => {
    source.on('end', resolve);
    source.on('error', reject);
    source.pipe(dest);
  })
};
module.exports.moveFile = moveFile;

/**
 * Create directory if not exists
 *
 * @param directory
 */
const checkDirectory = (directory) => {
  try {
    fs.statSync(directory);
  } catch (e) {
    fs.mkdirSync(directory);
  }
};
module.exports.checkDirectory = checkDirectory;

/**
 *
 * @param path
 * @returns {boolean}
 */
const isFileExists = (path) => {
  return fs.existsSync(path);
};
module.exports.isFileExists = isFileExists;

/**
 *
 * @param path Full path to file
 * @param alg Default: sha256
 * @returns {Promise<any>}
 */
const calcFileHash = (path, alg = 'sha256') => {
  return new Promise((resolve, reject) => {
    const hashSum = crypto.createHash(alg);
    const file = fs.createReadStream(path);
    file.on('error', function (err) {
      return reject(err);
    });
    file.on('data', function (chunk) {
      try {
        hashSum.update(chunk);
      } catch (e) {
        return reject(e)
      }
    });
    file.on('end', function () {
      const hex = hashSum.digest('hex');
      resolve(hex)
    });
  })
};
module.exports.calcFileHash = calcFileHash;

/**
 *
 * @param string
 * @param alg
 */
const calcHash = (string, alg = 'sha256') => {
  const hashSum = crypto.createHash(alg);
  hashSum.update(string);
  return hashSum.digest('hex');
};
module.exports.calcHash = calcHash;

/**
 *
 * @param path
 * @param sessionId
 * @returns {*}
 */
const createFileUploadToken = (path, sessionId) => {
  const jwtPayload = {
    act: 'upload', // action
    path: path, // path to file
    sess: sessionId, // sessionId
    srv: INSTANCE_ID,

    exp: Math.floor(Date.now() / 1000) + HUNDRED_DAYS, // 100 days from now
  };
  return jwt.sign(jwtPayload, JWT_SECRET, JWT_DEFAULT_OPTIONS);
};
module.exports.createFileUploadToken = createFileUploadToken;

/**
 *
 * @param jwtToken
 * @returns {*}
 */
const verifyFileUploadToken = (jwtToken) => {
  try {
    const decoded = jwt.verify(jwtToken, JWT_SECRET, { issuer: JWT_DEFAULT_OPTIONS.issuer });
    const isValidAction = decoded.hasOwnProperty('act') && decoded['act'] === 'upload';
    const isValidPath = decoded.hasOwnProperty('path');
    return isValidAction && isValidPath ? decoded : false;
  } catch (err) {
    return false;
  }
};
module.exports.verifyFileUploadToken = verifyFileUploadToken;

/**
 *
 * @param path Path to File
 * @param version Version
 * @returns {*}
 */
const createFileDownloadToken = (path, object, version) => {
  const jwtPayload = {
    act: 'download', // action
    path: path, // path to file
    obj: object,
    ver: version,
    srv: INSTANCE_ID, // service instance (download from this server in priority)

    exp: Math.floor(Date.now() / 1000) + HUNDRED_DAYS, // 100 days from now
  };
  return jwt.sign(jwtPayload, JWT_SECRET, JWT_DEFAULT_OPTIONS);
};
module.exports.createFileDownloadToken = createFileDownloadToken;

/**
 *
 * @param jwtToken JWT Token
 * @param path Path for verification
 * @returns {boolean}
 */
const verifyFileDownloadToken = (jwtToken, path) => {
  try {
    const decoded = jwt.verify(jwtToken, JWT_SECRET, { issuer: JWT_DEFAULT_OPTIONS.issuer });
    const isValidAction = decoded.hasOwnProperty('act') && decoded['act'] === 'download';
    const isValidPath = decoded.hasOwnProperty('path') && decoded['path'] === path;
    return isValidAction && isValidPath ? decoded : false;
  } catch (err) {
    return false;
  }
};
module.exports.verifyFileDownloadToken = verifyFileDownloadToken;


module.exports.getFreeSpaceInLocalStorage = () => {
  const maxDiskStorage = config.MAX_DISK_STORAGE;
  return new Promise((resolve, reject) => {
    getFolderSize(config.LOCAL_STORAGE_PATH, (err, size) => {
      if (err) {
        reject(err)
      } else {
        const data = {
          used: size,
          free: maxDiskStorage - size
        };
        resolve(data);
      }
    })
  })
};

const bytesToMegabytes = (bytes) => {
  return (bytes / 1024 / 1024).toFixed(2)
};
exports.bytesToMegabytes = bytesToMegabytes;

const parseContentRange = (contentRangeString) => {
  const range = contentRange.parse(contentRangeString);
  if (range) {
    range.isFirst = (range.first === 0);
    range.isLast = (range.last + 1 === range.length);
  }
  return range;
};
module.exports.parseContentRange = parseContentRange;

const writeToFile = (path, data) => {
  fs.writeFileSync(path, data);
};
module.exports.writeToFile = writeToFile;