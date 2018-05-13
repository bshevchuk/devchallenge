// Database Models
const db = require('../db');
const ObjectModel = db.Object;
// const ObjectVersionModel = db.ObjectVersion;

const utils = require('../utils');
const config = require('../config');
const redis = require('../redis');

module.exports.instances = async (req, res) => {
  res.header('DEVCHALLENGE-12-BACKEND-R1', config.INSTANCE_ID);
  redis.keys('instances:*', (err, instances) => {
    if (err) {
      res.send({ err: err })
    } else {
      instances
        .reduce((promise, instance) => {
          return promise.then((left) => {
            return new Promise((resolve, reject) => {
              redis.get(instance, (err, data) => {
                if (err) {
                  reject(err)
                } else {
                  const instanceId = instance.replace('instances:', '');

                  left.push({
                    id: instanceId,
                    free: data
                  });

                  resolve(left)
                }
              })
            })
          })
        }, Promise.resolve([]))
        .then(instances => {
          res.send({ instances: instances })
        })
    }
  });
};

module.exports.browseFiles = async (req, res) => {
  const objects = await ObjectModel.find({}).populate('versions');
  let list = objects.map(object => {
    const _object = {};
    _object.id = object.id;
    _object.path = object.path;
    _object.version = [];
    object.versions
      .filter(ver => {
        return !!ver.completed_at;
      })
      .forEach(version => {
        _object.version.push({
          id: version.id,
          size: version.total_size,
          content_type: version.content_type,
          created_at: version.created_at,
          completed_at: version.completed_at,
          token: utils.createFileDownloadToken(object.path, object.id, version.id)
        })
      });
    return _object;
  });
  res.header('DEVCHALLENGE-12-BACKEND-R1', config.INSTANCE_ID);
  res.send(list);
};
