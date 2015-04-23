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

  /**
   * Initiates login process.
   * Track results with actions: LoginProgress, LoginFail, LoginSuccess
   * @param username
   * @param passphrase or pin
   */
  Peerio.Data.login = function (username, passphrase) {
    // todo: reject login attempt on timeout
    // todo: reject on errors
    Peerio.Actions.loginProgress('Authenticating...');
    Peerio.storage.init(username);
    Peerio.user.login(username, passphrase, false, function () {
      // at the moment this callback is called
      // we should have some auth tokens if login was a success
      if (!Peerio.user.authTokens.length) {
        Peerio.Actions.loginFail();
        return;
      }

      Peerio.Actions.loginProgress('Retrieving user data...');
      Peerio.network.getSettings(function (data) {
        Peerio.user.firstName = data.firstName;
        Peerio.user.lastName = data.lastName;
        Peerio.user.addresses = data.addresses;
        Peerio.user.settings = data.settings;
        Peerio.user.quota = data.quota;

        Peerio.Actions.loginProgress('Retrieving contacts...');
        Peerio.Data.loadContacts(true)
          .then(function () {
            Peerio.Actions.loginProgress('Ready.');
            Peerio.Actions.loginSuccess();
          }).catch(function (err) {
            //todo remove alert, change loginFail to another event, this one is about credentials
            console.log(err);
            alert('error logging in');
            Peerio.Actions.loginFail();
          });
      });
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
    }).timeout(5000);
  };

}());