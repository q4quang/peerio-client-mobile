// If page was reloaded - we want to go to the root.
// We don't support app state recovery from hash url.
//
var hashIndex = window.location.href.indexOf('#');
if (hashIndex>=0) {
  window.location = window.location.href.substring(0,hashIndex);
}