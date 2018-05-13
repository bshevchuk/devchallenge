const formidable = require('formidable');
const fs = require('fs');
const readChunk = require('read-chunk');
const fileType = require('file-type');

const config = require('../config');
const ERRORS = config.ERRORS;
const isDebug = config.DEBUG === '1';

const ROOT_PATH = config.ROOT_PATH;
const STORAGE_PATH = config.LOCAL_STORAGE_PATH;

// Database Models
const db = require('../db');
const ObjectModel = db.Object;
const ObjectVersionModel = db.ObjectVersion;

// Helper
const utils = require('../utils');
const responseError = utils.responseError;

const prepareUploadHandler = async (req, res) => {
  const path = req.query.path;
  if (!path) {
    return responseError(res, ERRORS.INVALID_REQUEST, ['path']);
  }

  const sessionId = (new Date).getTime();
  const uploadToken = utils.createFileUploadToken(path, sessionId);
  const uploadPayload = {
    token: uploadToken
  };
  res.send(uploadPayload);
};


const appendUploadHandler = async (req, res) => {
  const token = req.headers['authorization'].replace('Bearer ', '');
  const requestPayload = utils.verifyFileUploadToken(token);
  if (!requestPayload) {
    return responseError(res, ERRORS.INVALID_UPLOAD_REQUEST, ['access_token']);
  }

  const isChuckedTransfer = req.headers.hasOwnProperty('transfer-encoding') && req.headers['transfer-encoding'] === 'chunked';

  let approximateSize = 0;

  const headerContentRange = req.headers['content-range'];
  let range;
  if (headerContentRange) {
    // chunk file uploads
    range = utils.parseContentRange(headerContentRange);
    approximateSize = range.length;
  } else {
    // default upload (single file)
    approximateSize = parseInt(req.headers['content-length']);
  }

  const filePath = requestPayload.path;
  const sessionKey = requestPayload.sess;

  const storage = await utils.getFreeSpaceInLocalStorage();
  if (approximateSize > storage.free) {
    return responseError(res, ERRORS.NO_FREE_SPACE);
  }

  let objectVersion = await ObjectVersionModel.findOne({ session_key: sessionKey });
  if (objectVersion && objectVersion.completed_at) {
    return responseError(res, ERRORS.VERSION_UPLOADED_EARLY);
  }

  let requestFile = null;
  let requestBody = null;

  async function fileProcess(file) {
    if (!file) {
      return responseError(res, ERRORS.MISSING_UPLOAD_FILE)
    }
    const tempFilePath = file.path;
    const tempFileSize = file.size;
    const tempFileHash = file.hash;

    let totalContentLength;
    let chunkRangeFrom;
    let chunkRangeTo;
    let isFirstChunk;
    let isLastChunk;

    if (headerContentRange && range) {
      totalContentLength = range.length;
      chunkRangeFrom = range.first;
      chunkRangeTo = range.last;
      isFirstChunk = range.isFirst;
      isLastChunk = range.isLast;
    } else {
      totalContentLength = tempFileSize;
      chunkRangeFrom = 0;
      chunkRangeTo = tempFileSize;
      isFirstChunk = true;
      isLastChunk = true;
    }

    try {
      const uploadFileHash = tempFileHash || await utils.calcFileHash(tempFilePath);

      let fileContentType;
      if (isFirstChunk) {
        const buffer = readChunk.sync(tempFilePath, 0, 4100);
        const tempfileContentType = fileType(buffer);
        if (tempfileContentType && tempfileContentType.mime) {
          fileContentType = tempfileContentType.mime
        }
      }

      let object = await ObjectModel.findOne({ path: filePath });
      if (object === null) {
        const objectModelPayload = {
          path: filePath
        };
        object = await ObjectModel.create(objectModelPayload)
      }

      const destDir = `${STORAGE_PATH}/${object.id}`;
      const destFile = `${destDir}/${uploadFileHash}`;

      // check if we can save a disk space
      const exist = utils.isFileExists(destFile);
      if (!exist) {
        utils.checkDirectory(destDir);
        await utils.moveFile(tempFilePath, destFile);
      }

      const chunkMetadata = {
        content_hash: uploadFileHash,
        range_from: chunkRangeFrom,
        range_to: chunkRangeTo,
        size: tempFileSize
      };

      if (objectVersion) {
        // have chunks

        objectVersion.blocks.push(chunkMetadata);
        if (isLastChunk) {
          objectVersion.completed_at = new Date();
        }
        objectVersion = await objectVersion.save()
      } else {
        // first block
        const objectVersionPayload = {
          session_key: sessionKey,
          total_size: totalContentLength,
          blocks: [chunkMetadata],
          content_type: fileContentType
        };
        if (isLastChunk) {
          objectVersionPayload.completed_at = new Date();
        }
        objectVersion = await ObjectVersionModel.create(objectVersionPayload);
      }

      if (isLastChunk) {
        object.last_version = objectVersion._id;
        object.versions.push(object.last_version);
        await object.save();

        return {
          status: "UPLOADED",
          id: objectVersion.id,
          path: object.path,
          version: {
            id: objectVersion.id,
            token: utils.createFileDownloadToken(object.path, object.id, objectVersion.id)
          },
        };
      } else {
        return {
          status: "APPLIED"
        }
      }
    } catch (err) {
      fs.unlink(tempFilePath);
      responseError(res, ERRORS.SERVER_ERROR)
    }
  }

  async function bodyProcess(body) {
    try {
      let object = await ObjectModel.findOne({ path: filePath });
      if (object === null) {
        const objectModelPayload = {
          path: filePath
        };
        object = await ObjectModel.create(objectModelPayload)
      }

      const size = body.length;
      const hash = utils.calcHash(body);

      const destDir = `${STORAGE_PATH}/${object.id}`;
      const destFile = `${destDir}/${hash}`;

      const exist = utils.isFileExists(destFile);
      if (!exist) {
        utils.checkDirectory(destDir);
        utils.writeToFile(destFile, body);
      }

      const chunkMetadata = {
        content_hash: hash,
        range_from: 0,
        range_to: size,
        size: size
      };

      if (objectVersion) {
        const chunks = objectVersion.blocks.sort((left, right) => right.range_from - left.range_from);
        const lastChunk = chunks[0];
        chunkMetadata.range_from = lastChunk.range_to + 1;
        chunkMetadata.range_to = lastChunk.range_to + size;
        objectVersion.blocks.push(chunkMetadata);
        objectVersion = await objectVersion.save()
      } else {
        const objectVersionPayload = {
          session_key: sessionKey,
          blocks: [chunkMetadata],
        };
        objectVersion = await ObjectVersionModel.create(objectVersionPayload);
      }

      return {
        status: "APPLIED"
      }
    } catch (err) {
      console.error(err);
      responseError(res, ERRORS.SERVER_ERROR)
    }
  }

  const onEnd = async () => {
    console.log('-> upload done');
    let response = {};
    if (isChuckedTransfer) {
      response = await bodyProcess(requestBody);
    } else {
      response = await fileProcess(requestFile);
    }
    res.send(response);
  };

  const onFile = (field, file) => {
    if (field === 'file' || field === 'files[]') {
      requestFile = file
    }
  };

  const onField = (field) => {
    requestBody = field;
  };

  let form = new formidable.IncomingForm();
  form.hash = 'sha256';
  // if (isDebug) {
  //   form.uploadDir = `${ROOT_PATH}/tmp_uploads`; // for debug
  // }
  if (isChuckedTransfer) {
    // our data in body
    form.on('field', onField);
  } else {
    form.on('file', onFile);
  }
  form.on('end', onEnd);
  form.parse(req);
};

const finishUploadHandler = async (req, res) => {
  const token = req.headers['authorization'].replace('Bearer ', '');
  const requestPayload = utils.verifyFileUploadToken(token);
  if (!requestPayload) {
    return responseError(res, ERRORS.INVALID_UPLOAD_REQUEST, ['access_token']);
  }

  const filePath = requestPayload.path;
  const sessionKey = requestPayload.sess;


  let objectVersion = await ObjectVersionModel.findOne({ session_key: sessionKey });
  if (objectVersion && objectVersion.completed_at) {
    return responseError(res, ERRORS.VERSION_UPLOADED_EARLY);
  }

  const object = await ObjectModel.findOne({ path: filePath });

  objectVersion.completed_at = new Date();
  await objectVersion.save();

  object.last_version = objectVersion._id;
  object.versions.push(object.last_version);
  await object.save();

  const response = {
    status: "UPLOADED",
    id: objectVersion.id,
    path: object.path,
    version: {
      id: objectVersion.id,
      token: utils.createFileDownloadToken(object.path, object.id, objectVersion.id)
    },
  };
  res.send(response)
};

module.exports.prepare = prepareUploadHandler;
module.exports.append = appendUploadHandler;
module.exports.finish = finishUploadHandler;