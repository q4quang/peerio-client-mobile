/**
 * NOTE: This particular file is not included in distribution.
 *       Use config_template.js to make your own config.js
 *
 * Peerio client API configuration.
 * Has to be loaded before other API code.
 *
 * todo: environment-specific configuration?
 */

var Peerio = this.Peerio || {};
Peerio.Config = {};

Peerio.Config.init = function () {
    'use strict';

    return new Promise(function (resolve) {

        var cfg = Peerio.Config = {};

        cfg.webSocketServer = (window.PeerioDebug && PeerioDebug.server) || 'wss://app.peerio.com';

        cfg.piwik = {
            server: 'https://piwik.peerio.com/piwik.php',
            site: 1
        };

        cfg.dbPrefix = /\/\/(.*)\.peerio\.com/.exec(cfg.webSocketServer)[1];
        if (cfg.dbPrefix === 'app') cfg.dbPrefix = '';

        cfg.push = {
            android: {
                senderID: '605156423279'
            }
        };

        cfg.cpuCount = navigator.hardwareConcurrency || 1;
        // if client will not receive pings for pingTimeout, connection will be considered broken
        cfg.pingTimeout = 50000;

        // network timeout for send to socket function
        cfg.serverResponseTimeout = 15000;

        // Set this dynamically to something related to device where app is currently running.
        // This secret key will be used for low-importance data encryption to store in on device.
        cfg.lowImportanceDeviceKey = 'f0905d253a79'; // change this to reset TinyDB values due to inability to decrypt them anymore :-D

        // using cordova device plugin if available
        if (window.device && device.uuid) cfg.lowImportanceDeviceKey = device.uuid;

        // using cordova cpu info plugin if available
        if (!navigator.hardwareConcurrency && window.chrome && chrome.system && chrome.system.cpu && chrome.system.cpu.getInfo) {
            chrome.system.cpu.getInfo(function (info) {
                var cpuCount = info.numOfProcessors || info.processors.length || 0;
                if (cpuCount) cfg.cpuCount = cpuCount;
                resolve();
            });
        } else resolve();

    });

};
