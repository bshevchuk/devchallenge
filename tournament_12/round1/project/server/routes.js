/**
 * Express.js Routes
 * @param app Express Instance
 */
const uploadHandlers = require('./modules/upload');
const downloadHandler = require('./modules/download');
const serviceHandlers = require('./modules/service');

module.exports = function (app) {
  /**
   * Uploading
   */
  app.route('/upload/prepare')
    .get(uploadHandlers.prepare);

  app.route('/upload/append')
    .post(uploadHandlers.append);

  app.route('/upload/finish')
    .post(uploadHandlers.finish);

  /**
   * Downloading
   */
  app.route('/download/*')
    .get(downloadHandler);

  /**
   * Service routes
   */
  app.route('/check_status')
    .get(serviceHandlers.instances);

  app.route('/storage/browse')
    .get(serviceHandlers.browseFiles)
  
};