var Route = ReactRouter.Route;
var DefaultRoute = ReactRouter.DefaultRoute;
var Link = ReactRouter.Link;
var RouteHandler = ReactRouter.RouteHandler;
var NotFoundRoute = ReactRouter.NotFoundRoute;

var Peerio = this.Peerio || {};

(function () {
  'use strict';

  Peerio.UI = {};

  // Main function executes when all systems are ready (dom, device)
  function main() {
    // peerio client api
    Peerio.initAPI();

    // order matters
    Peerio.ActionExtension.init();
    Peerio.AppStateExtension.init();
    Peerio.Helpers.init();

    Peerio.NativeAPI.init();
    Peerio.NativeAPI.hideKeyboardAccessoryBar();

    // Hardware/OS event handlers
    document.addEventListener('pause', Peerio.Action.pause, false);
    document.addEventListener('resume', Peerio.Action.resume, false);
    document.addEventListener('backbutton', Peerio.Action.hardBackButton, false);
    document.addEventListener('menubutton', Peerio.Action.hardMenuButton, false);

    React.initializeTouchEvents(true);

   // React.render(React.createElement(Peerio.UI.App, null), document.body);
    ReactRouter.run(Peerio.UI.Routes, ReactRouter.HashLocation, function(Root) {
      React.render(React.createElement(Root,null), document.body);
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