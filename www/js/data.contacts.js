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

  Peerio.Data.loadContacts = function (reportProgress) {
    return new Promise(function (resolve, reject) {
      Peerio.user.getAllContacts(function (identitiesMatch) {
        if (!identitiesMatch) Peerio.Actions.tOFUFail();

        if (reportProgress) Peerio.Actions.loginProgress('Building identicons...');
        Peerio.Data.buildIdenticons();

        if (reportProgress) Peerio.Actions.loginProgress('Building contact properties...');
        Peerio.Data.buildContactProperties();
        Peerio.user.fullName = Peerio.user.contacts[Peerio.user.username].fullName;
        Peerio.Actions.contactsUpdated();
        resolve();
      });
    });
  };

  Peerio.Data.buildIdenticons = function () {
    Peerio.Helpers.forEachContact(function (c) {
      if (!c.miniLockID) return;
      var avatar = Peerio.crypto.getAvatar(c.username, c.miniLockID);
      var size = 12, header = 'data:image/png;base64,';
      c.identicons12 = [];
      c.identicons12.push(header + new Identicon(avatar[0].substring(0, 32), size, 0).toString());
      c.identicons12.push(header + new Identicon(avatar[0].substring(32, 64), size, 0).toString());
      c.identicons12.push(header + new Identicon(avatar[1].substring(0, 32), size, 0).toString());
      c.identicons12.push(header + new Identicon(avatar[1].substring(32, 64), size, 0).toString());
      size = 18;
      c.identicons18 = [];
      c.identicons18.push(header + new Identicon(avatar[0].substring(0, 32), size, 0).toString());
      c.identicons18.push(header + new Identicon(avatar[0].substring(32, 64), size, 0).toString());
      c.identicons18.push(header + new Identicon(avatar[1].substring(0, 32), size, 0).toString());
      c.identicons18.push(header + new Identicon(avatar[1].substring(32, 64), size, 0).toString());
    });
  };

  Peerio.Data.buildContactProperties = function () {
    Peerio.Helpers.forEachContact(function (c) {
      c.fullName = c.firstName;
      if (c.fullName && c.lastName) c.fullName += ' ';
      c.fullName += c.lastName;
    });
  };
  // todo: handle errors in callbacks
  Peerio.Data.acceptContact = function (username) {
    Peerio.user.contacts[username].responsePending = true;
    Peerio.Actions.contactsUpdated();
    return new Promise(function (resolve, reject) {
      Peerio.network.acceptContactRequest(username, resolve);
    })
      .then(Peerio.Data.loadContacts)
      .timeout(60000, 'Accept contact request timed out.')
      .catch(function (error) {
        console.log(error);
        alert('Failed to accept contact request');
      })
      .finally(function(){
        Peerio.user.contacts[username].responsePending = false;
      });
  };

  Peerio.Data.rejectContact = function (username) {
    Peerio.user.contacts[username].responsePending = true;
    Peerio.Actions.contactsUpdated();
    return new Promise(function (resolve, reject) {
      Peerio.network.declineContactRequest(username, resolve);
    })
      .then(Peerio.Data.loadContacts)
      .timeout(60000, 'Reject contact request timed out.')
      .catch(function (error) {
        console.log(error);
        alert('Failed to reject contact request');
      })
      .finally(function(){
        Peerio.user.contacts[username].responsePending = false;
      });
  };

  Peerio.Data.removeContact = function (username) {
    Peerio.user.contacts[username].responsePending = true;
    Peerio.Actions.contactsUpdated();
    return new Promise(function (resolve, reject) {
      var c = Peerio.user.contacts[username];
      if(c.isRequest && !c.isReceivedRequest)
        Peerio.network.cancelContactRequest(username, resolve);
      else
        Peerio.network.removeContact(username, resolve);
    })
      .then(Peerio.Data.loadContacts)
      .timeout(60000, 'Remove contact request timed out.')
      .catch(function (error) {
        console.log(error);
        alert('Failed to remove contact.');
        Peerio.user.contacts[username].responsePending = false;
      });
  };

  Peerio.Data.addContact = function (username) {
    return new Promise(function (resolve, reject) {
      Peerio.network.addContact([{username: username}], resolve);
    })
      .then(Peerio.Data.loadContacts)
      .timeout(60000, 'Add contact request timed out.')
      .catch(function (error) {
        console.log(error);
        alert('Failed to add contact.');
      });
  };

}());