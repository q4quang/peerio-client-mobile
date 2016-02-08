/**
 * Various helper functions that didn't fit anywhere else
 * ------------------------------------------------------
 */
var Peerio = this.Peerio || {};
Peerio.DataCollection = Peerio.DataCollection || {};
Peerio.DataCollection.Signup = Peerio.DataCollection.Signup || {};
Peerio.DataCollection.App = Peerio.DataCollection.App || {};

Peerio.DataCollection.init = function () {
    'use strict';

    var api = Peerio.DataCollection;

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

    api.trackUserAction = function(category, name, value) {
        if(!api.isEnabled()) return;
        value = value ? value : 1;
        L.info('Tracking event category: ' + category + ', name: ' + name + ', value: ' + value);
        window._paq.push(['trackEvent', category, name, category + '_' + name, value]);
    };

    api.startTimePoint = function() {
        if(!api.isEnabled()) return;
    };

    api.endTimePoint = function() {
        if(!api.isEnabled()) return;
    };

    var signup = Peerio.DataCollection.Signup;

    signup.trackAction = function(name, value) {
        api.trackUserAction('signup', name, value);
    };

    signup.startSignup = function() {
        signup.trackAction('start');
    };

    signup.successfulSignup = function() {
        signup.trackAction('success');
    };

    signup.generatePassphrase = function() {
        signup.trackAction('generatePassphrase');
    };

    var app = Peerio.DataCollection.App;

    app.trackAction = function(name, value) {
        api.trackUserAction('app', name, value);
    };

    app.openSideBar = function() {
        app.trackAction('openSideBar');
    };

    app.closeSideBarNoAction = function() {
        app.trackAction('closeSideBarNoAction');
    };

    app.closeSideBar = function() {
        app.trackAction('closeSideBar');
    };
};

