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

    var isEnabled = null;

    // substates which we want to track
    var subStates = [];

    var prevPage = null;

    var timePoints = {};

    var delayedPaq = {};

    (function () {
        var items = [];
        var limit = 1000;

        delayedPaq.push = function (item) {
            items.push(item);
            if(items.length > limit) items.shift();
        };

        delayedPaq.get = function () {
            return items;
        };

        delayedPaq.clear = function () {
            items = [];
        };
    }());

    

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

    api.isUndefined = function() {
        return !Peerio.user && (isEnabled === null);
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

    api.trackUserAction = function(category, name, value, delayed) {
        if(!api.isUndefined() && !api.isEnabled()) return;
        value = value ? value : 1;
        var arr = api.isUndefined() ? delayedPaq : window._paq;
        L.info('Tracking event category: ' + category + ', name: ' + name + ', value: ' + value);
        arr.push(['trackEvent', category, name, category + '_' + name, value]);
    };

    api.flushDelayedTracking = function() {
        if(api.isEnabled()) {
            for(var i of delayedPaq.get()) {
                window._paq.push(i);
            }
        }
        delayedPaq.clear();
    };

    /**
     * Starts a time point for data collection
     * @param name unique name for the time point
     * @param clean do nothing if we already have the same point in storage
     */
    api.startTimePoint = function(name, clean) {
        if(!clean && timePoints[name]) return;
        timePoints[name] = Date.now();
    };

    api.endTimePoint = function(name) {
        if(timePoints[name]) {
            var timeSpan = Date.now() - timePoints[name];
            delete timePoints[name];
            api.trackUserAction('timepoints', name, timeSpan);
        }
    };

    api.trackCountry = function(code) {
        api.trackUserAction('country', code);
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

