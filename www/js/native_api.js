/**
 * Cordova/Native API wrapper
 * Allows us to abstract away platform api differences
 *
 * Before using this API you need to call Peerio.NativeAPI.initialize() after DeviceReady event.
 *
 */

(function () {
  'use strict';

  window.Peerio = window.Peerio || {};
  var api = Peerio.NativeAPI = {};
  var cordova = window.cordova;
  var initializers = {};

  //----- internal helpers
  function getGenericMsg(name) {
    return (name ? name + ': ' : '') + 'Native API not available';
  }

  function getFileApiGenericInitializer(name) {
    return function () {
      if (cordova && cordova.file) return;

      return Promise.reject.bind(null, getGenericMsg(name));
    };
  }

  //----- end of internal helpers

  /**
   * call this function during application startup but after DeviceReady event
   * it resolves availability/differences in implementation
   */
  api.initialize = function () {
    _.forOwn(initializers, function (fn, name) {
      // if initializer returns alternative function
      // (usually a mock that is safe to call)
      // assign that function instead of original one
      var alterFn = fn();
      if (alterFn) api[name] = alterFn;
    });
    // cleaning memory
    initializers = null;
    api.initialize = null;
  };

  /**
   * Hide software keyboard
   */
  api.hideKeyboard = function () {
    cordova.plugins.Keyboard.close();
  };

  initializers.hideKeyboard = function () {
    if (cordova && cordova.plugins && cordova.plugins.Keyboard)
      return;

    return console.log.bind(console, getGenericMsg('hideKeyboard'));
  };

  /**
   * Get app version from config.xml
   * @param {function(string)} callback
   */
  api.getAppVersion = function (callback) {
    cordova.getAppVersion(callback);
  };

  initializers.getAppVersion = function () {
    if (cordova && cordova.getAppVersion)
      return;

    return console.log.bind(console, getGenericMsg('getAppVersion'));
  };

  /**
   * Get private to application, not synced to cloud root DirectoryEntry
   * @returns {Promise} 'resolve' receives DirectoryEntry instance
   */
  api.getRootDir = function () {
    return new Promise(function (resolve, reject) {
      // todo cache path
      var path = '';
      if(is.ios())
        path = cordova.file.dataDirectory;
      else if (is.android())
        path = cordova.file.externalDataDirectory;
      else if(is.blackberry())
        path = cordova.file.sharedDirectory;

      window.resolveLocalFileSystemURL(path, resolve, reject);
    });
  };

  initializers.getRootDir = function () {
    if (cordova && window.resolveLocalFileSystemURL && cordova.file)
      return;

    return Promise.reject.bind(null, getGenericMsg('getRootDir'));
  };

  /**
   * Get DirectoryEntry with specified name, given parent DirectoryEntry.
   * If target does not exist - it will be created.
   * @param {string} name - directory name you want to get
   * @param {DirectoryEntry} parent - parent directory for the one you want to get
   * @returns {Promise} 'resolve' receives DirectoryEntry instance
   */
  api.getDirectory = function (name, parent) {
    return new Promise(function (resolve, reject) {
      parent.getDirectory(name, {create: true, exclusive: false}, resolve, reject);
    });
  };

  initializers.getDirectory = getFileApiGenericInitializer('getDirectory');

  /**
   * Get array of files (FileEntry) in directory.
   * @param {DirectoryEntry} dir
   * @returns {Promise} FileEntry[] will be passed to resolved promise
   */
  api.getFilesList = function (dir) {
    return new Promise(function (resolve, reject) {
      dir.createReader().readEntries(resolve, reject);
    }).then(function (entries) {
        for (var i = entries.length - 1; i >= 0; i--) {
          if (entries[i].isFile) continue;
          entries.splice(i, 1);
        }

        return entries;
      });
  };

  initializers.getFilesList = getFileApiGenericInitializer('getFilesList');

  /**
   * Returns FileEntry by DirectoryEntry and file name
   * @param {string} name
   * @param {DirectoryEntry} parent
   * @returns {Promise} - FileEntry is passed to success callback
   */
  api.getFile = function (name, parent) {
    return new Promise(function (resolve, reject) {
      parent.getFile(name, {create: false}, resolve, reject);
    });
  };

  initializers.getFile = getFileApiGenericInitializer('getFile');

  /**
   * Create file and return FileEntry.
   * If file exists it will be returned with default writing position at 0.
   * @param {string} name - file name
   * @param {DirectoryEntry} parent - parent folder for file
   */
  api.createFile = function (name, parent) {
    return new Promise(function (resolve, reject) {
      parent.getFile(name, {create: true, exclusive: false}, resolve, reject);
    });
  };

  initializers.createFile = getFileApiGenericInitializer('createFile');

  /**
   * Remove file
   * @param {string} name - file name to remove
   * @param {DirectoryEntry} parent - parent folder for file
   */
  api.removeFile = function (name, parent) {
    return new Promise(function (resolve, reject) {
      parent.getFile(name, {create: false}, resolve, reject);
    })
      .then(function (fileEntry) {
        return new Promise(function (resolve, reject) {
          fileEntry.remove(resolve, reject);
        });
      });
  };

  initializers.removeFile = getFileApiGenericInitializer('removeFile');

  /**
   * Writes blob to file from beginning
   * @param {FileEntry} file
   * @param {Blob} blob to write
   */
  api.writeToFile = function (blob, file) {
    return new Promise(function (resolve, reject) {
      file.createWriter(function (writer) {
        writer.onerror = reject;
        writer.onwrite = resolve;
        writer.write(blob);
      }, reject);
    });
  };
  /**
   * Removes directory with all of its content
   * @param {DirectoryEntry} dir
   */
  api.removeDirectory = function (dir) {
    return new Promise(dir.removeRecursively);
  };

  initializers.removeDirectory = getFileApiGenericInitializer('removeDirectory');

  /**
   * Opens file with another apps installed on device
   * @param {FileEntry} fileEntry - fileEntry to open
   * @returns {Promise}
   */
  api.openFile = function (fileEntry) {
    return new Promise(function (resolve, reject) {
      cordova.plugins.disusered.open(fileEntry.toURL(), resolve, reject);
    });
  };

  initializers.openFile = getFileApiGenericInitializer('openFile');

}());