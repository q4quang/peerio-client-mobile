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
        // we want this to be executed ASAP, so we don't use Actions but add explicit handlers instead
        document.addEventListener('pause', function(){
           console.log('UI PAUSE');
            if(Peerio.Net){
                Peerio.Net.pauseConnection();
            }
        }, true);
        document.addEventListener('resume', function(){
            console.log('UI RESUME');
            if(Peerio.Net){
                Peerio.Net.resumeConnection();
            }
        }, true);

        // todo: rethink
        Peerio.runtime = {};

        // platform-specific classes on body
        if (window.device) {
            var platform = device.platform.toLowerCase();
            L.info('Detected platform: {0}', platform);
            if (platform === 'ios')
                document.body.classList.add('ios');
            else if (platform === 'android')
                document.body.classList.add('android');

            Peerio.runtime.platform = platform;
        } else Peerio.runtime.platform = 'browser';

        // peerio client api
        Peerio.initAPI().then(function () {
            // order matters
            Peerio.ActionExtension.init();
            Peerio.AppStateExtension.init();
            Peerio.Helpers.init();

            Peerio.NativeAPI.init();

            Peerio.NativeAPI.hideKeyboardAccessoryBar(false);
            Peerio.NativeAPI.shrinkViewOnKeyboardOpen(true);
            Peerio.NativeAPI.disableScrollingInShrinkView(true);

            Peerio.FileSystemPlugin.init();

            React.initializeTouchEvents(true);

            ReactRouter.run(Peerio.UI.Routes, ReactRouter.HashLocation, function (Root) {
                React.render(React.createElement(Root, null), document.getElementById('approot'));
            });

            return Promise.resolve();
        });
    }

    // Start rendering on DOM and device ready
    document.addEventListener('DOMContentLoaded', function () {
        if (window.cordova)
            document.addEventListener('deviceready', main, false);
        else
            main();
    });
    //
    //var autoFocusControls = ['textarea', 'text', 'password'];
    //var lastTarget = '';
    //document.addEventListener('focusin', function (ev) {
    //    if (ev && ev.target && autoFocusControls.indexOf(ev.target.type) >= 0) {
    //        window.setTimeout(function () {
    //            ev.target.scrollIntoView({block: "start", behavior: "smooth"});
    //            //if (lastTarget !== ev.target) {
    //            //    ev.target.blur();
    //            //    window.setTimeout(function () {
    //            //        ev.target.focus();
    //            //    }, 0);
    //            //}
    //            //lastTarget = ev.target;
    //        }, 500);
    //    }
    //});

}());
