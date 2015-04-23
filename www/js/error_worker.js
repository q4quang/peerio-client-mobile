/**
 * Error interceptor worker
 * Tries to collect and send to server unhandled error information
 *
 * This script should ideally use vanilla js only,
 * so it won't fail in case of errors in some lib it uses
 */
/*eslint-disable*/
'use strict';
/*eslint-enable*/

var reportsPerMinuteLimit = 20;
var oneMinuteInMs = 60000;
var reportUrl = 'https://debug.peerio.com/api/report';


// will hold timestamps of last sent reports
// to help reduce reporting rate
var lastReports = [];

// returns number of unix milliseconds for current utc time
function getUTCTimeStamp() {
  var now = new Date();
  return now.valueOf() + now.getTimezoneOffset() * oneMinuteInMs;
}

function errorHandler(ver, url, line, col, message, errorType, stack) {
  var now = getUTCTimeStamp();

  // checking for exceeded report rate limit
  // first removing all the reports older then 1 minute
  for (var i = 0; i < lastReports.length; i++)
    if ((now - lastReports[i]) > oneMinuteInMs)
      lastReports.splice(i--, 1);

  // if limit reached - skipping this report
  if (lastReports.length > reportsPerMinuteLimit) return;

  // if not - sending it
  lastReports.push(now);

  var report = {
    ts: Math.floor(now / 1000),
    url: url,
    row: line,
    col: col,
    msg: message,
    errType: errorType,
    stack: stack,
    version: ver
  };

  var request = new XMLHttpRequest();   // new HttpRequest instance
  request.open('POST', reportUrl);
  request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  request.send(JSON.stringify(report));
}

onmessage = function (e) {
  errorHandler(e.data[0], e.data[1], e.data[2], e.data[3], e.data[4], e.data[5], e.data[6]);
};

