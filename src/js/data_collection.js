/**
 * Various helper functions that didn't fit anywhere else
 * ------------------------------------------------------
 */
var Peerio = this.Peerio || {};
Peerio.DataCollection = {};

Peerio.DataCollection.init = function () {
    'use strict';

    var api = Peerio.DataCollection = {};

    var isEnabled = false;

    api.enable = function() {
        L.info('Enabling data collection');
        isEnabled = true;
        return Promise.resolve(isEnabled);
    };

    api.disable = function() {
        L.info('Disabling data collection');
        isEnabled = false;
        return Promise.resolve(isEnabled);
    };

    api.isEnabled = function() {
        return (!Peerio.user && isEnabled)
        || (Peerio.user && Peerio.user.settings && Peerio.user.settings.dataCollectionOptIn);
    };

    api.insertPiwikCode = function() {
        if(!api.isEnabled()) return;
        // global array which is used by piwik script
        // to asynchronously send data to server
        var _paq = window._paq || [];
        
        _paq.push(['setTrackerUrl', Peerio.Config.piwik.server]);
        _paq.push(['setSiteId', Peerio.Config.piwik.site]);

        window._paq = _paq;
    };

    api.trackUserAction = function() {
        if(!api.isEnabled()) return;
    };

    api.startTimePoint = function() {
        if(!api.isEnabled()) return;
    };

    api.endTimePoint = function() {
        if(!api.isEnabled()) return;
    };

};

