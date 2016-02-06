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

    // substates which we want to track
    var subStates = [];

    var prevPage = null;

    api.enable = function() {
        L.info('Enabling data collection');
        isEnabled = true;
        api.enterCurrentPage();
        return Promise.resolve(isEnabled);
    };

    api.disable = function() {
        L.info('Disabling data collection');
        // if it was previously enabled, make sure current url is set to null
        api.enterNullPage();
        isEnabled = false;
        return Promise.resolve(isEnabled);
    };

    api.isEnabled = function() {
        return (!Peerio.user && isEnabled)
        || (Peerio.user && Peerio.user.settings && Peerio.user.settings.dataCollectionOptIn);
    };

    api.insertPiwikCode = function() {
        // global array which is used by piwik script
        // to asynchronously send data to server
        var _paq = window._paq || [];
        
        _paq.push(['setTrackerUrl', Peerio.Config.piwik.server]);
        _paq.push(['setSiteId', Peerio.Config.piwik.site]);

        window._paq = _paq;

        ReactRouter.HashLocation.addChangeListener( (loc) => { 
            loc && loc.path && api.enterPage(loc.path);
        });
    };

    api.pushSubState = function(state) {
        subStates.push(state);
        api.enterCurrentPage();
    };

    api.popSubState = function() {
        if(subStates.length) {
            subStates.pop();
        }
    };

    api.clearSubState = function() {
        subStates = [];
    };

    api.getPath = function() {
        var path = ReactRouter.HashLocation.getCurrentPath();
        if(subStates.length) path += '/' + subStates.join('/');
        return path;
    };

    api.enterCurrentPage = function() {
        api.enterPage(api.getPath());
    };

    api.enterNullPage = function() {
        api.enterPage('/null');
    };

    api.enterPage = function(loc) {
        if(!api.isEnabled()) return;
        var path = api.getPath(); 
        L.info('Tracking ' + path);
        Piwik.getAsyncTracker().setCustomUrl(path); 
        _paq.push(['trackPageView', path]);
        prevPage = path;
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

