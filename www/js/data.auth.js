/**
 * Peerio Data/Business logic layer
 * --------------------------------
 * Provides abstracted access to Peerio core javascript,
 * since it was written for angular desktop app and is not fully decoupled/abstracted yet.
 *
 * Peerio.Data provides API for direct use,
 * but mostly it should react on Actions and generate Actions in response.
 *
 */
(function () {
  'use strict';

  window.Peerio = window.Peerio || {};
  Peerio.Data = Peerio.Data || {};

  var loginTimeout = 60000;
  // promisified login helpers,
  // todo: should be moved to the new api, when it will be developed
  var doLogin = function (username, passphrase) {
    return new Promise(function (resolve, reject) {

      Peerio.storage.init(username);
      Peerio.user.login(username, passphrase, false, function () {
        // at the moment this callback is called
        // we should have some auth tokens if login was a success
        if (Peerio.user.authTokens.length) resolve();
        else reject("Invalid passphrase or PIN");
      });

    });
  };

  var getSettings = function () {
    return new Promise(function (resolve, reject) {
      Peerio.network.getSettings(function (data) {
        Peerio.user.firstName = data.firstName;
        Peerio.user.lastName = data.lastName;
        Peerio.user.addresses = data.addresses;
        Peerio.user.settings = data.settings;
        Peerio.user.quota = data.quota;
        resolve();
      });
    });
  };

  /**
   * Initiates login process.
   * Track results with actions: LoginProgress, LoginFail, LoginSuccess
   * @param username
   * @param passphrase or pin
   */
  Peerio.Data.login = function (username, passphrase) {
    Peerio.Actions.loginProgress('Authenticating...');
    doLogin(username, passphrase)
      .then(Peerio.Actions.loginProgress.bind(null, 'Retrieving user data...'))
      .then(getSettings)
      .then(Peerio.Actions.loginProgress.bind(null, 'Retrieving contacts...'))
      .then(Peerio.Data.loadContacts.bind(null, true))
      .then(function () {
        Peerio.Actions.loginProgress('Ready.');
        Peerio.Actions.loginSuccess();
      })
     // .timeout(loginTimeout)
      .catch(function (err) {
        console.log(err);
        Peerio.Actions.loginFail((err && err.message) || 'Login fail');
      });
  };

  Peerio.Data.validate2FA = function (code, callback) {
    Peerio.network.validate2FA(code, function (data) {
      if (data && data.hasOwnProperty('error'))
        Peerio.Actions.twoFAValidateFail();
      else {
        Peerio.Actions.twoFAValidateSuccess();
      }
      callback();
    });
  };

  Peerio.Data.setPIN = function (code) {
    return new Promise(function (resolve, reject) {
      Peerio.user.setPIN(code, Peerio.user.username, resolve);
    });
  };

  Peerio.Data.removePIN = function () {
    return new Promise(function (resolve, reject) {
      Peerio.user.removePIN(Peerio.user.username, resolve);
    }).timeout(5000);// todo: remove magic number
  };

  var lastLoginId = 'lastLogin';
  Peerio.Data.setLastLogin = function (login) {
    var db = new PouchDB('_default', Peerio.storage.options);
    db.get(lastLoginId).then(function (doc) {
      return db.put({
        _id: lastLoginId,
        _rev: doc._rev,
        login: login
      });
    }).catch(function (err) {
      db.put({
        _id: lastLoginId,
        login: login
      });
    });
  };

  Peerio.Data.getLastLogin = function (login) {
    var db = new PouchDB('_default', Peerio.storage.options);
    return db.get(lastLoginId)
      .then(function (doc) {
        return doc.login;
      });
  };

}());