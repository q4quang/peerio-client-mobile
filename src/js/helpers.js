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
     * @param conversationID {string}   - Id of the conversation to iterate
     * @param fn             {function(message)} - function to call for each message in conversation
     */
    api.forEachMessage = function (conversationID, fn) {
        if (!Peerio.user || !Peerio.user.conversations) return;
        var m = Peerio.user.conversations.hasOwnProperty(conversationID) ? Peerio.user.conversations[conversationID].messages : null;
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

    api.getFileName = function(filePath) {
        return filePath.replace(/^.*[\\\/]/, '');
    };

    api.getFileNameWithoutExtension = function(filePath) {
        return api.getFileName(filePath).replace(/\..*?$/, '');
    };
    /**
     * Extracts extension from file name
     * @param fileName
     * @returns {string} dot-less extension
     */
    api.getFileExtension = function (fileName) {
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

    //TODO: this should be a generic helper function, placed elsewhere.
    api.formatBytes = function formatBytes(bytes, decimals) {
        if(bytes == 0) return '0 Byte';
        var k = 1024;
        var dm = decimals + 1 || 1;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    /**
     * Validates first or last name in signup and settings
     */
    api.isNameValid = function(name) {
        return !name || !!name.match(/^[a-zа-яãâàâåáéèêëîïôûùüÿýçñæœößøòôõóìîíùûúà .\-']{1,20}$/i);
    };

    api.isValidEmail = function(val) {
        var emailRegex = new RegExp(/^([\w+-]+(?:\.[\w+-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i);
        return emailRegex.test(val);
    };

    api.isValidPhone = function(val) {
        var phoneRegex = new RegExp(/^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/i);
        return phoneRegex.test(val);
    };

    /** 
     * Reformat phone so it is more or less the same as on server
     */
    api.reformatPhone = function(val) {
        return val.replace(/[+\-\. ]/g, '').replace(/^0*/g, '');
    };

    /**
    * Username: 1 to 16 characters, letters, numbers
    * and underscore. 
    * Validated both server and client side. /^\w{1,16}$/
    */
    api.isValidUsername = function(name) {
        return !!name.match(/^\w{1,16}$/);
    };


    var CFS_KEYNAME = 'check_filesystem_encryption';

    api.checkFileSystemEncryption = function() {
        try {
            (Peerio.runtime.platform == 'android') &&
            window.FileEncryption &&
            Peerio.TinyDB.getItem(CFS_KEYNAME, Peerio.user.username)
            .then(val => {
                val ||
                    window.FileEncryption.getEncryptionStatus()
                    .then(status => {
                        if(status == 2) return;
                        var text = 'Your device supports full disk encryption, but it is not currently enabled. Peerio highly recommends the use of disk encryption. Would you like to learn more?';
                        if(status == 1)
                            text = 'Your device has encryption turned on but your passcode is still set to the default. We recommend setting a unique passcode. Would you like to learn more?';
                        if(status == -1)
                            text = 'Your device does not support encryption. We recommend upgrading to a version of Android which does. Would you like to learn more?';

                        Peerio.UI.Confirm.show({
                            text: text,
                            okText: 'Yes',
                            cancelText: 'No'
                        })
                        .then(() => Peerio.NativeAPI.openInBrowser('https://support.google.com/nexus/answer/2844831?hl=en'))
                        .catch(() => L.info('user cancel'))
                        .finally(() => {
                            Peerio.TinyDB.saveItem(CFS_KEYNAME, true, Peerio.user.username);
                        });
                    });
            });
        } catch(e) {
            L.error(e);
        }
    };
};
