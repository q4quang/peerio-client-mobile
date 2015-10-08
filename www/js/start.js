var Route = ReactRouter.Route;
var DefaultRoute = ReactRouter.DefaultRoute;
var Link = ReactRouter.Link;
var RouteHandler = ReactRouter.RouteHandler;
var NotFoundRoute = ReactRouter.NotFoundRoute;

var Peerio = this.Peerio || {};

// todo: put this in a right place
Peerio.ACK_MSG = ':::peerioAck:::';

(function () {
  'use strict';

  Peerio.UI = {};

  // Main function executes when all systems are ready (dom, device)
  function main() {
    // todo: rethink
    Peerio.runtime ={};

    // platform-specific classes on body
    if (window.device) {
      var platform = device.platform.toLowerCase();
      if (platform === 'ios')
        document.body.classList.add('ios');
      else if (platform === 'android')
        document.body.classList.add('android');

      Peerio.runtime.platform = platform;
    } else Peerio.runtime.platform = "browser";

    // peerio client api
    Peerio.initAPI().then(function () {
      // order matters
      Peerio.ActionExtension.init();
      Peerio.AppStateExtension.init();
      Peerio.Helpers.init();

      Peerio.NativeAPI.init();
      // keyboard plugin currently (10.09.2015) fails to execute this with wkwebview
      // but sometimes, in perfect future...
      Peerio.NativeAPI.hideKeyboardAccessoryBar();
      // same thing but this call messes up wkwebview, while it is the default behaviour on android
      //Peerio.NativeAPI.shrinkViewOnKeyboardOpen();

      Peerio.FileSystemPlugin.init();

      // Hardware/OS event handlers
      document.addEventListener('pause', Peerio.Action.pause, false);
      document.addEventListener('resume', Peerio.Action.resume, false);
      document.addEventListener('backbutton', Peerio.Action.hardBackButton, false);
      document.addEventListener('menubutton', Peerio.Action.hardMenuButton, false);
      //window.document.addEventListener("offline", this.setOffline, false);
      //window.document.addEventListener("online", this.setOnline, false);

      React.initializeTouchEvents(true);

      ReactRouter.run(Peerio.UI.Routes, ReactRouter.HashLocation, function (Root) {
        React.render(React.createElement(Root, null), document.getElementById('approot'));
      });
    });
  }

  // Start rendering on DOM and device ready
  document.addEventListener('DOMContentLoaded', function () {
    if (window.cordova)
      document.addEventListener('deviceready', main, false);
    else
      main();
  });

}());