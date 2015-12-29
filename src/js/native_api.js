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

    //-- SYSTEM EVENT HANDLERS -----------------------------------------------------------------------------------------
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

    //-- PLUGIN AVAILABILITY TESTS -------------------------------------------------------------------------------------
    // we need separate tests because cordova plugins are not using the same (window.cordova.plugins)namespace
    // and in case of separate plugins fail to load (?) we isolate them this way
    function isKeyboardPluginAvailable() {
        if (window.Keyboard) return true;
        L.info('Native API: Keyboard plugin not available.');
        return false;
    }

    function isInsomniaPluginAvailable() {
        if (window.plugins && window.plugins.insomnia) return true;
        L.info('Native API: Insomnia plugin not available.');
        return false;
    }

    function isClipboardAvailable() {
        if (cordova && cordova.plugins && cordova.plugins.clipboard) return true;
        L.info('Native API: Clipboard plugin not available.');
        return false;
    }

    function isCameraAvailable() {
        if (navigator.camera) return true;
        L.info('Native API: Camera plugin not available.');
        return false;
    }

    function isPushNotificationAvailable() {
        if (window.PushNotification) return true;
        L.info('NativeAPI: Push notifications not available');
        return false;
    }

    //-- INTERNAL BROWSER ----------------------------------------------------------------------------------------------
    /**
     * Opens url in safari or inAppBrowser, whatever is available
     * @param url
     */
    api.openInBrowser = function (url) {
        var open = cordova.InAppBrowser.open || window.open;
        try {
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
                    function (msg) {
                    }, // success callback
                    function (msg) {
                        L.error(msg);
                    });
            });
        } catch (ex) {
            L.error('Failed to open url in browser. {0}', ex);
        }
    };


    //-- KEYBOARD ------------------------------------------------------------------------------------------------------
    /**
     * Hide software keyboard
     */
    api.hideKeyboard = function () {
        try {
            isKeyboardPluginAvailable() && Keyboard.hide();
        } catch (ex) {
            L.error('Failed to hide keyboard. {0}', ex);
        }
    };

    /**
     * For IOS only. Hides 'accessory bar' with 'next', 'previous' and 'done' buttons when keyboard is open.
     */
    api.hideKeyboardAccessoryBar = function () {
        try {
            isKeyboardPluginAvailable() && Keyboard.hideFormAccessoryBar(true);
        } catch (ex) {
            L.error('Failed to hide keyboard accessory bar. {0}', ex);
        }
    };
    /**
     * For IOS only. Shows 'accessory bar' with 'next', 'previous' and 'done' buttons when keyboard is open.
     */
    api.showKeyboardAccessoryBar = function () {
        try {
            isKeyboardPluginAvailable() && Keyboard.hideFormAccessoryBar(false);
        } catch (ex) {
            L.error('Failed to show keyboard accessory bar. {0}', ex);
        }
    };

    /**
     *  Shrinks the webview instead of viewport when keyboard is open/
     */
    api.shrinkViewOnKeyboardOpen = function () {
        try {
            isKeyboardPluginAvailable() && Keyboard.shrinkView(true);
        } catch (ex) {
            L.error('Failed to change view shrink settings. {0}', ex);
        }
    };

    /**
     *  Shrinks the viewport instead of webview when keyboard is open.
     */
    api.doNotShrinkViewOnKeyboardOpen = function () {
        try {
            isKeyboardPluginAvailable() && Keyboard.shrinkView(false);
        } catch (ex) {
            L.error('Failed to change view shrink settings. {0}', ex);
        }

    };

    api.enableScrollingInShrinkView = function () {
        try {
            isKeyboardPluginAvailable() && Keyboard.disableScrollingInShrinkView(false);
        } catch (ex) {
            L.error('Failed to change shrink scroll settings. {0}', ex);
        }

    };

    api.disableScrollingInShrinkView = function () {
        try {
            isKeyboardPluginAvailable() && Keyboard.disableScrollingInShrinkView(true);
        } catch (ex) {
            L.error('Failed to change shrink scroll settings. {0}', ex);
        }
    };

    //-- DEVICE POWER MANAGEMENT ---------------------------------------------------------------------------------------
    /**
     * Prevents smartphone sleep if idle while app is open
     */
    api.preventSleep = function () {
        try {
            isInsomniaPluginAvailable() && window.plugins.insomnia.keepAwake();
        } catch (ex) {
            L.error('Failed to prevent sleep. {0}', ex);
        }

    };

    /**
     * Allows smartphone to sleep if idle while app is open
     */
    api.allowSleep = function () {
        try {
            isInsomniaPluginAvailable() && window.plugins.insomnia.allowSleepAgain();
        } catch (ex) {
            L.error('Failed to allow sleep. {0}', ex);
        }

    };

    //-- DEVICE INFORMATION --------------------------------------------------------------------------------------------
    /**
     * Get app version from config.xml
     */
    api.getAppVersion = function () {
        return window.AppVersion && AppVersion.version || 'n/a';
    };

    //-- CAMERA --------------------------------------------------------------------------------------------------------
    /**
     * Takes picture from camera or photo library
     * @param {bool} camera - set true to take a new picture instead of picking from the library
     * @returns {Promise<string>} - file url
     */
    api.takePicture = function (camera) {
        if (!isCameraAvailable()) return Promise.reject();

        return new Promise(function (resolve, reject) {
            navigator.camera.getPicture(resolve, reject, {
                // please, don't change properties without (re)reading docs on them first and testing result afterwards.
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

    /**
     * Removes all temporary pictures taken with previous cordova camera plugin calls
     */
    api.cleanupCamera = function () {
        try {
            isCameraAvailable() && navigator.camera.cleanup();
        } catch (ex) {
            L.error('Failed to cleanup camera. {0}', ex);
        }
    };


    //-- CLIPBOARD -----------------------------------------------------------------------------------------------------
    api.copyToClipboard = function (text) {
        if (!isClipboardAvailable()) return Promise.reject();

        return new Promise((resolve, reject) => cordova.plugins.clipboard.copy(text, resolve, reject));
    };

    //-- PUSH NOTIFICATIONS --------------------------------------------------------------------------------------------
    /**
     * Enables push notifications (if possible on the platform)
     * @returns {Promise}
     */
    api.enablePushNotifications = function () {
        if (!isPushNotificationAvailable()) return Promise.reject();

        L.info('Enabling push notifications.');

        return new Promise(function (resolve, reject) {
            var push = PushNotification.init({
                'ios': {'alert': 'true', 'badge': 'true', 'sound': 'true'},
                'android': {'senderID': Peerio.Config.push.android.senderId}
            });

            api.push = push;

            push.on('registration', function (data) {
                L.info('push notification reg.id: ' + data.registrationId);
                var to_send = {};
                to_send[Peerio.runtime.platform] = data.registrationId;
                Peerio.Net.registerMobileDevice(to_send);
                resolve();
                L.info('push notifications enabled');
            });

            push.on('notification', function (data) {
                L.silly('push notification received: {0}', data);
            });

            push.on('error', function (e) {
                L.error('push notification error: {0}', e);
                reject();
            });

        });
    };

    /**
     * Disables push notifications
     * @returns Promise
     */
    api.disablePushNotifications = function () {
        return new Promise(function (resolve, reject) {
            if (!api.push) {
                resolve();
                return;
            }

            api.push.unregister(function () {
                L.info('Push notifications disabled.');
                resolve();
            }, function () {
                L.info('Failed to disable push notifications.');
                reject();
            });
        });
    };

    /**
     * Sets badge number
     */
    api.setPushBadge = function (number) {
        api.push && api.push.setApplicationIconBadgeNumber(
            () => L.info('push badge number set'),
            e => L.error('error setting push badge number. {0}', e),
            number);
    };

    /**
     * Clears badge
     */
    api.clearPushBadge = function () {
        api.setPushBadge(0);
    };

    //------------------------------------------------------------------------------------------------------------------

};
