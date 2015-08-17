/**
 * Peerio Data/Business logic layer
 * --------------------------------
 * Provides abstracted access to Peerio core javascript,
 * since it was written for angular desktop app and is not fully decoupled/abstracted yet.
 *
 * Peerio.Data provides API for direct use,
 * but mostly it should react on Actions and generate Actions in response.
 *
 */
(function () {
  'use strict';

  window.Peerio = window.Peerio || {};
  Peerio.Data = Peerio.Data || {};
  var api = Peerio.NativeAPI;

  /**
   * @returns {Promise} DirectoryEntry for decrypted files cache root folder
   */
  Peerio.Data.getDecryptedRootDir = function () {
    return api.getRootDir()
      .then(api.getDirectory.bind(null, Peerio.user.username))
      .then(api.getDirectory.bind(null, 'decrypted'));
  };

  /**
   * @returns {Promise} string[] of file names cached locally in decrypted state
   */
  Peerio.Data.getCachedFiles = function () {
    // checking for window.cordova to be able to test on desktop when developing
    return window.cordova ? Peerio.Data.getDecryptedRootDir().then(api.getFilesList) : Promise.resolve([]);
  };

  /**
   * Saves file to decrypted root dir for user
   * @param {string} fileName
   * @param {Blob} blob
   * @returns {Promise}
   */
  Peerio.Data.saveFile = function (fileName, blob) {
    return Peerio.Data.getDecryptedRootDir()
      .then(api.createFile.bind(null, fileName))
      .then(api.writeToFile.bind(null, blob));
  };

  /**
   * Loads files list into Peerio.user.files
   * Checks local file cache and updates data structures accordingly.
   * @returns nothing
   */
  Peerio.Data.loadFiles = function (force) {
    if (!force && Peerio.user.filesLoaded) return Promise.resolve();
    Peerio.Action.loading();
    return Promise.join(Peerio.Data.getCachedFiles(), new Promise(Peerio.file.getFiles), function (localFiles) {
      _.forOwn(Peerio.user.files, function (file) {
        file.localName = Peerio.Helpers.sha256(file.id) + '.' + Peerio.Helpers.getFileExtension(file.name);
      });
      localFiles.forEach(function (local) {
        var found = _.find(Peerio.user.files, function (file) {
          return file.localName === local.name;
        });
        if (found) found.cached = true;
      });
      Peerio.user.filesLoaded = true;
      Peerio.Action.filesUpdated();
    }).finally(Peerio.Action.loadingDone);
  };

  /**
   * Starts file downloading and saving process.
   * Communicates about execution state through Actions.
   * @param file - peerio file object
   */
  Peerio.Data.downloadFile = function (file) {
    if (file.downloadState) return;
    file.downloadState = {progress: 0, state: 'downloading...'};
    Peerio.Action.filesUpdated();
    new Promise(function (resolve) {
      Peerio.file.downloadFile(file.id, file.header, reportDownloadProgress.bind(null, file), resolve);
    }).then(function (decryptedBlob) {
        if (!decryptedBlob)
          throw new Error('failed to download file');

        file.downloadState.progress = null;
        file.downloadState.state = 'saving...';
        Peerio.Action.filesUpdated();

        return Peerio.Data.saveFile(file.localName, decryptedBlob)
          .then(function () {
            file.cached = true;
          });

      }).catch(function (err) {
        console.log(err);
        alert(err);
      })
      .finally(function () {
        file.downloadState = null;
        Peerio.Action.filesUpdated();
      });
  };

  function reportDownloadProgress(file, progress) {
    if (!progress.lengthComputable) return;
    var val = Math.round((progress.loaded / progress.total) * 100);
    if (file.downloadState.progress === val) return;
    if (val === 100) {
      val = null;
      file.downloadState.state = 'decrypting...';
    }

    file.downloadState.progress = val;

    Peerio.Action.filesUpdated();
  }

  /**
   * removes locally cached file from /username/decrypted folder
   * @param file - Peerio file object
   * @returns {Promise}
   */
  Peerio.Data.removeCachedFile = function (file) {
    return Peerio.Data.getDecryptedRootDir()
      .then(function (dir) {
        return api.removeFile(file.localName, dir);
      })
      .then(function () {
        file.cached = false;
        Peerio.Action.filesUpdated();
      });
  };
  /**
   * Removes file from cloud and locally
   * @param {string} file - Peerio file object
   * @param {boolean} [nuke] - pass true to nuke file
   * @returns {Promise}
   * todo: promise could resolve before local file is removed,
   * todo: but it's not important at the moment as update event will still be called
   * todo: although it's better to optimize it in future to remove redundant updates
   */
  Peerio.Data.removeFile = function (file, nuke) {
    return new Promise(function (resolve, reject) {
      var fn = nuke ? Peerio.network.nukeFile : Peerio.network.removeFile;
      fn([file.id], function (data) {
        if (data != null && data.hasOwnProperty('success'))
          resolve(data.success);
        else
          reject(data);
      });
    }).then(function (deletedIds) {
        deletedIds.forEach(function (s) {
          if (file.cached) Peerio.Data.removeCachedFile(Peerio.user.files[s]);
          delete Peerio.user.files[s];
        });
        Peerio.Action.filesUpdated();
      });
  };

  /**
   * Opens locally cached file with default file handler app on the device
   * @param file - peerio file object
   */
  Peerio.Data.openCachedFile = function (file) {
    return Peerio.Data.getDecryptedRootDir()
      .then(function (dir) {
        return api.getFile(file.localName, dir);
      })
      .then(function (fileEntry) {
        return api.openFile(fileEntry);
      });
  };

}());