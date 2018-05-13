/**
 * Express.js Routes
 * @param app Express Instance
 */
const uploadHandlers = require('./routes/upload');
const downloadHandler = require('./routes/download');
const storageHandler = require('./routes/storage');

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
    .get((req, res) => {
      res.send("ALIVE");
    });

  app.route('/storage/browse')
    .get(storageHandler.browseFiles)
  
};