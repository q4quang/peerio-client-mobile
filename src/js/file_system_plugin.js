/**
 *  File System Plugin
 *  ===================
 *  Provides mobile-specific basic file access functions to client API
 *
 */

var Peerio = this.Peerio || {};
Peerio.FileSystemPlugin = {};

Peerio.FileSystemPlugin.init = function () {
    'use strict';

    var api = Peerio.FileSystemPlugin;
    delete Peerio.FileSystemPlugin.init;
    if (!window.cordova) return;

    Peerio.FileSystem.plugin = api;

    var cordova = window.cordova;
    var root;
    /**
     * Get private to application, not synced to cloud root DirectoryEntry
     * @returns {Promise<DirectoryEntry>}
     */
    api.getRootDir = function () {
        if (root) return Promise.resolve(root);

        return new Promise(function (resolve, reject) {
            var dataDir = cordova.file.dataDirectory;
            window.resolveLocalFileSystemURL(dataDir, function (dir) {
                root = dir;
                resolve(dir);
            }, reject);
        });
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

    /**
     * Get array of files (FileEntry) in directory.
     * @param {DirectoryEntry} dir
     * @returns {Promise<FileEntry[]>}
     */
    api.getFiles = function (dir) {
        return new Promise(function (resolve, reject) {
            dir.createReader().readEntries(resolve, reject);
        })
            .then(function (entries) {
                // filtering out non-file entries
                for (var i = entries.length - 1; i >= 0; i--) {
                    if (entries[i].isFile) continue;
                    entries.splice(i, 1);
                }

                return entries;
            });
    };

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

    api.getFileProperties = function (fileEntry) {
        return new Promise(function (resolve, reject) {
            fileEntry.file(resolve, reject);
        });
    };

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
    /**
     * Returns file or directory entry by url
     * @param {string} fileURL - in `file://...` format
     * @returns {Promise<FileEntry|DirectoryEntry>}
     */
    api.getByURL = function (fileURL) {
        // HACK for kitkat incorrect URLs
        // todo: other file types?
        if (fileURL.substring(0, 21) == 'content://com.android') {
            var photo_split = fileURL.split('%3A');
            fileURL = 'content://media/external/images/media/' + photo_split[1];
        }
        return new Promise(function (resolve, reject) {
            resolveLocalFileSystemURL(fileURL, resolve, reject);
        });
    };
    /**
     * Reads and returns contents of a file
     * @param {FileEntry} fileEntry - file entry to read
     * @returns {Promise<Object<File, ArrayBuffer>>} - File object and ArrayBuffer file data
     */
    api.readFile = function (fileEntry) {
        return new Promise(function (resolve, reject) {
            fileEntry.file(resolve, reject);
        }).then(function (file) {
            //todo report read progress
            return new Promise(function (resolve, reject) {
                var reader = new FileReader();
                reader.onload = function (event) {
                    resolve({file: file, data: event.target.result});
                };
                reader.onerror = reject;
                reader.readAsArrayBuffer(file);
            });
        });
    };

};
