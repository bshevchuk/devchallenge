// Database Models
const db = require('../db');
const ObjectModel = db.Object;
const ObjectVersionModel = db.ObjectVersion;

const utils = require('../utils');

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
  res.send(list);
};
