/**
 * Cordova/Native API wrapper
 * Allows us to abstract away platform api differences
 *
 * Before using this API you need to call Peerio.NativeAPI.initialize() after DeviceReady event.
 *
 */

var Peerio = this.Peerio || {};
Peerio.NativeAPI = {};

Peerio.NativeAPI.init = function () {
    'use strict';

    var api = Peerio.NativeAPI;
    delete Peerio.NativeAPI.init;

    var cordova = window.cordova;
    var safariView = window.SafariViewController;

    // Hardware/OS event handlers
    document.addEventListener('pause', Peerio.Action.pause, false);
    document.addEventListener('resume', Peerio.Action.resume, false);
    document.addEventListener('backbutton', Peerio.Action.hardBackButton, true);
    document.addEventListener('menubutton', Peerio.Action.hardMenuButton, true);
    window.addEventListener('offline', Peerio.Action.setOffline, false);
    window.addEventListener('online', Peerio.Action.setOnline, false);
    window.addEventListener('keyboardHeightWillChange', Peerio.Action.viewShrink, true);
    window.addEventListener('keyboardWillShow', Peerio.Action.keyboardWillShow, true);
    window.addEventListener('keyboardDidShow', Peerio.Action.keyboardDidShow, true);
    window.addEventListener('keyboardWillHide', Peerio.Action.keyboardWillHide, true);
    window.addEventListener('keyboardDidHide', Peerio.Action.keyboardDidHide, true);



    /**
     * Opens url in inAppBrowser
     * @param url
     */
    api.openInBrowser = function (url) {
        var open = cordova.InAppBrowser.open || window.open;

        if (!safariView) {
            open && open(url, '_blank', 'location=yes');
            return;
        }

        safariView.isAvailable(function (available) {
            if (!available) {
                open && open(url, '_blank', 'location=yes');
                return;
            }
            safariView.show({'url': url, 'enterReaderModeIfAvailable': false},
                function (msg) {}, // success callbakc
                function (msg) {
                    L.error(msg);
                });
        });
    };


    function isKeyboardPluginAvailable() {
        if (window.Keyboard) return true;
        L.info('Native API: Keyboard plugin not available.');
        return false;
    }

    /**
     * Hide software keyboard
     */
    api.hideKeyboard = function () {
        if (!isKeyboardPluginAvailable()) return;

        Keyboard.hide();
    };

    /**
     * For IOS only. Hides 'accessory bar' with 'next', 'previous' and 'done' buttons.
     */
    api.hideKeyboardAccessoryBar = function (hide) {
        if (!isKeyboardPluginAvailable()) return;
        Keyboard.hideFormAccessoryBar(hide);
    };

    /**
     *  When keyboard is open, shrinks the webview instead of viewport
     */
    api.shrinkViewOnKeyboardOpen = function (shrink) {
        if (!isKeyboardPluginAvailable()) return;
        Keyboard.shrinkView(shrink);
    };

    ////
    api.disableScrollingInShrinkView = function (disable) {
        if (!isKeyboardPluginAvailable()) return;
        Keyboard.disableScrollingInShrinkView(disable);
    };

    function isInsomniaPluginAvailable(){
        if(window.plugins && window.plugins.insomnia) return true;
        L.info('Native API: Insomnia plugin not available.');
        return false;
    }

    api.preventSleep = function () {
        window.plugins.insomnia.keepAwake();
    };

    initializers.preventSleep = function () {
        if (window.plugins && window.plugins.insomnia) return;

        return console.log.bind(console, getGenericMsg('preventSleep'));
    };

    api.allowSleep = function () {
        window.plugins.insomnia.allowSleepAgain();
    };

    initializers.allowSleep = function () {
        if (window.plugins && window.plugins.insomnia) return;

        return console.log.bind(console, getGenericMsg('allowSleep'));
    };

    /**
     * Get app version from config.xml
     * @param {function(string)} callback
     */
    api.getAppVersion = function () {
        return window.AppVersion && AppVersion.version || 'n/a';
    };

    /**
     * Takes picture from camera or photo library
     * @param {bool} camera - set true to take a new picture instead of picking from the library
     * @returns {Promise<string>} - file url
     */
    api.takePicture = function (camera) {
        return new Promise(function (resolve, reject) {
            navigator.camera.getPicture(resolve, reject, { // please, don't change properties without (re)reading docs on them first and testing result after
                    // yes, Anri, especially you!
                    sourceType: camera ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY,
                    destinationType: Camera.DestinationType.FILE_URI,
                    encodingType: Camera.EncodingType.JPEG,
                    mediaType: Camera.MediaType.ALLMEDIA,
                    cameraDirection: Camera.Direction.BACK,
                    allowEdit: false,
                    correctOrientation: true,
                    saveToPhotoAlbum: false,
                    quality: 90
                });
        });
    };

    api.pluginsAvailable = function () {
        return !(typeof cordova === 'undefined' || typeof cordova.plugins === 'undefined' || typeof cordova.plugins.clipboard === 'undefined');
    };

    api.copyToClipboard = function (text) {
        return new Promise((resolve, reject) => {
            if (!api.pluginsAvailable()) {
                L.info('clipboard is unavailable on the platform');
                reject('clipboard is unavailable on the platform');
            } else {
                var clipboard = cordova.plugins.clipboard;
                clipboard.copy(text, function () {
                    L.info('copied successfully');
                    resolve('copied successfully');
                }, function () {
                    L.info('copy failed');
                    reject('copy failed');
                });
            }
        });
    };

    /**
     * Enables push notifications (if possible on the platform)
     * @returns {Promise<bool>} - whether enabling notifications was successful or not
     */
    api.enablePushNotifications = function () {
        return new Promise(function (resolve, reject) {
            if (typeof PushNotification === 'undefined') {
                L.info('push notifications are unavailable on the platform');
                reject('push notifications are unavailable on the platform');
            }
            L.info('enabling push notifications');
            var push = PushNotification.init({
                'ios': { 'alert': 'true', 'badge': 'true', 'sound': 'true' },
                'android': { 'senderID': Peerio.Config.push.android.senderId }
            });
            push.on('registration', function (data) {
                L.info('push notification reg.id: ' + data.registrationId);
                if (window.device && window.device.platform) {
                    var platform = window.device.platform.toLowerCase();
                    var to_send = {};
                    to_send[platform] = data.registrationId;
                    Peerio.Net.registerMobileDevice(to_send);
                    window.L.info(to_send);
                    api.push = push;
                    resolve(to_send);
                }
            });
            push.on('notification', function (data) {
                L.info('push notification message: ' + data.message);
                L.info('push notification title: ' + data.title);
                L.info('push notification count: ' + data.count);
            });

            push.on('error', function (e) {
                L.info('push notification error: ' + e.message);
                reject('push notification error: ' + e.message);
            });

            L.info('push notifications enabled');
        });
    };

    /**
     * Disables push notifications
     * @returns Promise
     */
    api.disablePushNotifications = function () {
        return new Promise(function (resolve, reject) {
            if (api.push) {
                api.push.unregister(function () {
                    L.info('push unregister succeeded');
                    resolve('unregister success');
                }, function () {
                    L.info('push unregister failed');
                    reject('unregister failed');
                });
            } else {
                resolve('no push notifications were enabled');
            }
        });
    };

    /**
     * Sets badge number 
     */
    api.setPushBadge = function(number) {
        api.push && api.push.setApplicationIconBadgeNumber( () => {
            L.info('push badge number set');
        }, (e) => {
            L.error('error setting push badge number');
        }, number);
    };

    /**
     * Clears badge
     */
    api.clearPushBadge = function() {
        api.setPushBadge(0);
    };

    initializers.takePicture = function () {
        if (navigator.camera) return;

        return console.log.bind(console, getGenericMsg('takePicture'));
    };

    /**
     * Removes all temporary pictures taken with previous cordova camera plugin calls
     */
    api.cleanupCamera = function () {
        navigator.camera.cleanup();
    };

    initializers.cleanupCamera = function () {
        if (navigator.camera) return;

        return console.log.bind(console, getGenericMsg('cleanupCamera'));
    };

    /**
     * It was like this in the existing code
     */
    api.signOut = function () {
        window.location.reload();
    };
//--------------------------------------------------------------------------------------------------------------------
    _.forOwn(initializers, function (fn, name) {
        // if initializer returns alternative function
        // (usually a mock that is safe to call)
        // assign that function instead of original one
        var alterFn = fn();
        if (alterFn) api[name] = alterFn;
    });
    // cleaning memory
    initializers = null;
    //--------------------------------------------------------------------------------------------------------------------
};
