/**
 * Various helper functions that didn't fit anywhere else
 * ------------------------------------------------------
 */
var Peerio = this.Peerio || {};
Peerio.Helpers = {};

Peerio.Helpers.init = function () {
  'use strict';

  var api = Peerio.Helpers = {};

  /**
   * Returns same element or first parent dom element that has a specific css class
   * @param element - dom element from which to start search
   * @param className - class name to look for
   * @returns dom element or null
   */
  api.getParentWithClass = function (element, className) {
    do {
      if (element.classList.contains(className)) return element;
      element = element.parentElement;
    } while (element);
    return null;
  };

  /**
   * Returns function that updates React component's state on call
   * You can get static state updater passing static object like {stateVar: false}
   * Or dynamic updater where passed parameters will map to state variables.
   * You can request both static and dynamic update in one call.
   * @param self - 'this' of react component
   * @param staticState - state object to update to (will merge to mapped state if it's present)
   * @param mappedState - in case when state needs to be updated from action parameter
   *                      pass mappedState in following format
   *                      {statePropName: argumentIndex, statePropName: argumentIndex2,...}
   * @param callback    - optional. will be passed to setState so React.js can call it once state is set
   * @returns {function}
   * @note  at least one of the states should be specified. If passed both - they will be merged.
   */
  api.getStateUpdaterFn = function (self, staticState, mappedState, callback) {
    // validating params
    if (!staticState && !mappedState) throw 'Wrong use of getStateUpdaterFn.';

    // building function to return. It is important to not mutate original arguments.
    var ret = function () {
      var state;
      if (mappedState) {
        // saving top scope arguments
        var args = arguments;
        // mapping object to arguments
        var map = _.clone(mappedState);
        _.forOwn(map, function (val, key) {
          map[key] = args[val];
        });
        // merging states
        if (staticState) {
          state = _.clone(staticState);
          _.assign(state, map);
        } else state = map;
      } else state = staticState;
      // setting state
      self.setState(state, callback);
    };

    return ret;
  };

  /**
   * Safely iterates through conversation, calling function on each message
   * @param conversationId {string}   - Id of the conversation to iterate
   * @param fn             {function(message)} - function to call for each message in conversation
   */
  api.forEachMessage = function (conversationId, fn) {
    if (!Peerio.user || !Peerio.user.conversations) return;
    var m = Peerio.user.conversations.hasOwnProperty(conversationId) ? Peerio.user.conversations[conversationId].messages : null;
    if (m === null) return;

    for (var id in m) {
      if (!m.hasOwnProperty(id)) continue;
      var item = m[id];
      if (!item.decrypted) continue;
      fn(item);
    }
  };



  /**
   * Produces human-readable file size
   * @param bytes
   * @returns {string}
   */
  api.bytesToSize = function (bytes) {
    if (bytes === 0) return '0 Byte';
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
  };



  /**
   *  FILE HELPERS
   */

  var fileTypes = [
    {
      type: 'archive',
      extensions: [
        'zip', 'rar', 'tar', 'gz',
        '7z', 'ace', 'cab', 'gzip'
      ],
      icon: 'file-archive-o'
    },
    {
      type: 'audio',
      extensions: [
        'mp3', 'm4a', 'aac', 'flac',
        'wav', 'ogg', 'wma', 'aiff',
        '3gp',
      ],
      icon: 'file-audio-o'
    },
    {
      type: 'code',
      extensions: [
        'js', 'c', 'java', 'sh',
        'rb', 'clj', 'php', 'rake',
        'py', 'pl', 'cpp', 'cmd',
        'css', 'html', 'htm', 'xhtm',
        'xhtml', 'h', 'm', 'go'
      ],
      icon: 'file-code-o'
    },
    {
      type: 'image',
      extensions: [
        'jpg', 'jpeg', 'png', 'bmp',
        'gif', 'tiff', 'psd'
      ],
      icon: 'file-image-o'
    },
    {
      type: 'video',
      extensions: [
        'mp4', 'avi', 'wmv', 'webm',
        'mov', 'mkv', 'flv', 'ogv'
      ],
      icon: 'file-video-o'
    },
    {
      type: 'pdf',
      extensions: [
        'pdf', 'xpdf', 'pdfx'
      ],
      icon: 'file-pdf-o'
    },
    {
      type: 'word',
      extensions: [
        'doc', 'dot', 'docx', 'docm',
        'dotx', 'dotm', 'docb'
      ],
      icon: 'file-word-o'
    },
    {
      type: 'excel',
      extensions: [
        'xls', 'xlt', 'xlm', 'xlsx',
        'xlsm', 'xltx', 'xltm'
      ],
      icon: 'file-excel-o'
    },
    {
      type: 'powerpoint',
      extensions: [
        'ppt', 'pot', 'pps', 'pptx',
        'pptm', 'potx', 'potm', 'ppam',
        'ppsx', 'ppsm', 'sldx', 'sldm'
      ],
      icon: 'file-powerpoint-o'
    },
    {
      type: 'text',
      extensions: [
        'txt', 'rtf', 'text', 'md',
        'markdown'
      ],
      icon: 'file-text-o'
    },
    {
      type: 'other',
      extensions: [''],
      icon: 'file-o'
    }
  ];

  api.fileIconsByExt = {};
  api.fileTypeByExt = {};

  fileTypes.forEach(function (type) {
    type.extensions.forEach(function (ext) {
      api.fileIconsByExt[ext] = type.icon;
      api.fileTypeByExt[ext] = type.type;
    });
  });
  /**
   * Extracts extension from file name
   * @param fileName
   * @returns {string} dot-less extension
   */
  api.getFileExtension = function(fileName){
    var extension = fileName.toLowerCase().match(/\.\w+$/);
    extension = extension ? extension[0].substring(1) : '';
    return extension;
  };

  api.getFileTypeByName = function (fileName) {
    return api.fileTypeByExt[api.getFileExtension(fileName)] || 'file';
  };

  api.getFileIconByName = function (fileName) {
    return api.fileIconsByExt[api.getFileExtension(fileName)] || 'file-o';
  };

};
