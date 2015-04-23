(function () {
  'use strict';

  // Initializing global object to store UI components
  window.Peerio = window.Peerio || {};

  // Peerio core code will running in mobile mode
  Peerio.isMobile = true;

  Peerio.UI = Peerio.UI || {};

  // TODO: handle this properly somewhere
  var noop = function (a) {
    if (a !== undefined) {
      console.log('MOCKED FN MSG: ', a);
    }
  };

  // core js calls this, TODO: change core to use event system
  Peerio.UI.contactsSectionPopulate = Peerio.Data.loadContacts;
  Peerio.UI.onSocketReconnecting = Peerio.Actions.socketDisconnect;
  Peerio.UI.onSocketReconnect = Peerio.Actions.socketConnect;
  Peerio.UI.messagesSectionUpdate = Peerio.Data.refreshMessages;
  Peerio.UI.twoFactorAuth = Peerio.Actions.twoFARequest;
  Peerio.UI.showRateLimitedAlert = noop.bind(null, 'rate limited.');
  Peerio.UI.showBlacklistedAlert = noop.bind(null, 'blacklisted.');
  Peerio.UI.filesSectionPopulate = Peerio.Data.loadFiles.bind(null, true);
  // Hardware/OS event handlers
  document.addEventListener('pause', Peerio.Actions.pause, false);
  document.addEventListener('resume', Peerio.Actions.resume, false);
  document.addEventListener('backbutton', Peerio.Actions.hardBackButton, false);
  document.addEventListener('menubutton', Peerio.Actions.hardMenuButton, false);

  // Main function executes when all systems are ready (dom, device)
  function main() {
    Peerio.NativeAPI.initialize();
    React.initializeTouchEvents(true);
    React.render(React.createElement(Peerio.UI.App, null), document.body);
  }

  // Start rendering on DOM and device ready
  document.addEventListener('DOMContentLoaded', function () {
    if (window.cordova)
      document.addEventListener('deviceready', main, false);
    else
      main();

  });

}());