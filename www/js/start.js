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
  Peerio.UI.messagesSectionUpdate = Peerio.Data.refreshMessages;
  Peerio.UI.showRateLimitedAlert = noop.bind(null, 'rate limited.');
  Peerio.UI.showBlacklistedAlert = noop.bind(null, 'blacklisted.');
  Peerio.UI.filesSectionPopulate = Peerio.Data.loadFiles.bind(null, true);


  // Main function executes when all systems are ready (dom, device)
  function main() {
    Peerio.initAPI();
    // order matters
    Peerio.ActionExtension.init();
    Peerio.AppStateExtension.init();

    Peerio.NativeAPI.init();
    Peerio.NativeAPI.hideKeyboardAccessoryBar();

    // Hardware/OS event handlers
    document.addEventListener('pause', Peerio.Action.pause, false);
    document.addEventListener('resume', Peerio.Action.resume, false);
    document.addEventListener('backbutton', Peerio.Action.hardBackButton, false);
    document.addEventListener('menubutton', Peerio.Action.hardMenuButton, false);

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