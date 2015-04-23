/**
 * Starts Error interceptor worker and feeds error data to it
 */

(function () {
  'use strict';
   return;
  // we don't need error reporting on dev machines
  if (window.PeerioDebug && window.PeerioDebug.noErrorReporting) return;

  var appVersion = 'n/a';

  // will not fire in desktop browser, and we don't need it to
  document.addEventListener('deviceready', function () {
    Peerio.NativeAPI.getAppVersion(function (code) {
        appVersion = code;
      },
      console.error.bind(console, 'failed to retrieve app version'));
  }, false);


  var errorWorker = new Worker('js/error_worker.js');

  window.onerror = function (aMessage, aUrl, aRow, aCol, aError) {
    // url, line, col
    var msg = [appVersion, aUrl, aRow, aCol];
    if (aError != null) {
      msg.push(aError.message || aMessage, aError.name, aError.stack);
    } else msg.push(aMessage);
    // url, line, col, message, errorType, stack
    errorWorker.postMessage(msg);
  };

}());