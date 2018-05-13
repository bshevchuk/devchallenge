const fs = require('fs');
const parseRange = require('range-parser');
const readChunk = require('read-chunk');

const config = require('../config');
const STORAGE_PATH = config.LOCAL_STORAGE_PATH;
const ERRORS = config.ERRORS;

// Database Models
const db = require('../db');
const ObjectVersionModel = db.ObjectVersion;

// Helper
const utils = require('../utils');
const responseError = utils.responseError;
const between = utils.between;

const downloadHandler = async (req, res) => {
  const virtualFilePath = req.params[0];

  const token = req.query.access_token || (req.headers['authorization'] || '').replace('Bearer ', '');
  const requestPayload = utils.verifyFileDownloadToken(token, virtualFilePath);
  if (!requestPayload) {
    return responseError(res, ERRORS.INVALID_DOWNLOAD_REQUEST, ['access_token']);
  }

  const objectId = requestPayload['obj'];
  const versionId = requestPayload['ver'];

  try {
    const objectVersion = await ObjectVersionModel.findById(versionId);
    if (!objectVersion || !objectVersion.completed_at) {
      return responseError(res, ERRORS.VERSION_NOT_UPLOADED)
    }

    let range;
    const headerContentRange = req.headers['range'];
    if (headerContentRange) {
      const ranges = parseRange(objectVersion.total_size, headerContentRange);
      range = ranges[0]
    }

    const responseHeaders = {
      'DEVCHALLENGE-12-BACKEND-R1': config.INSTANCE_ID,
      // "Content-Type": "application/octet-stream",
      // "Content-Disposition": "attachment; filename=",

      'Content-Type': 'application/octet-stream',
      'Transfer-Encoding': 'chunked'
    };
    if (objectVersion.content_type) {
      responseHeaders['Content-Type'] = objectVersion.content_type
    }
    if (objectVersion.total_size) {
      responseHeaders['Content-Length'] = objectVersion.total_size
    }
    res.writeHead(200, responseHeaders);

    const chunks = objectVersion.blocks.sort((left, right) => left.range_from - right.range_from);
    if (range) {
      // if needs return a part of file
      return await chunks
        .reduce((promise, chunk) => {
          return promise.then(() => {
            return new Promise((resolve, reject) => {
              const chunkRangeStart = chunk.range_from;
              const chunkRangeEnd = chunk.range_to;
              const chunkSize = chunk.size;

              const isFullChunkInside = range.start <= chunkRangeStart && chunkRangeEnd <= range.end;
              const startCrossed = between(range.start, chunkRangeStart, chunkRangeEnd);
              const endCrossed = between(range.end, chunkRangeStart, chunkRangeEnd);
              const isReqRangeCrossedChunkRange =  startCrossed || endCrossed;

              if (isFullChunkInside || isReqRangeCrossedChunkRange) {
                let seekPos = 0;
                let seekLen = 0;

                if (isFullChunkInside) {
                  seekLen = chunkSize
                } else {
                  const byteCorrection = (isReqRangeCrossedChunkRange ? 1 : 0);
                  if (chunkRangeStart < range.start) {
                    seekPos = range.start - chunkRangeStart;
                  }
                  if (range.end > chunkRangeEnd) {
                    seekLen = chunkRangeEnd - range.start + byteCorrection;
                  } else {
                    seekLen = range.end - chunkRangeStart - seekPos + byteCorrection;
                  }
                }
                console.log(`ReqRange: ${JSON.stringify(range)} ChunkRange: (${chunk.range_from},${chunk.range_to}) Seek(${seekPos},${seekLen}|${chunk.size})`)
                const sourceFile = `${STORAGE_PATH}/${objectId}/${chunk.content_hash}`;
                try {
                  const buffer = readChunk.sync(sourceFile, seekPos, seekLen);
                  res.write(buffer);
                  resolve()
                } catch (err) {
                  reject(err)
                }
              } else {
                resolve()
              }
            })
          })
        }, Promise.resolve())
        .then(() => {
          res.end();
        })
        .catch(err => {
          console.error(err);
          res.end();
        })
    } else {
      // otherwise return all content
      return await chunks
        .reduce(async (promise, chunk) => {
          return promise.then(() => {
            return new Promise((resolve, reject) => {
              const sourceFile = `${STORAGE_PATH}/${objectId}/${chunk.content_hash}`;
              const stream = fs.createReadStream(sourceFile);
              stream.on('data', (chunk) => {
                res.write(chunk)
              });
              stream.on('error', (err) => {
                reject(err)
              });
              stream.on('end', () => {
                resolve()
              });
            })
          })
        }, Promise.resolve())
        .then(() => {
          res.end();
        })
        .catch(err => {
          console.error(err);
          res.end();
        })
    }
  } catch (err) {
    console.error(err);
    return responseError(res, ERRORS.SERVER_ERROR);
  }
};

module.exports = downloadHandler;