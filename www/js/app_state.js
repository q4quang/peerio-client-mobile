/**
 *  Subscribes to certain actions and keeps track of global application state.
 *  Provides interface to global state.
 *  This is useful when some new component gets instantiated
 *  and might have missed some of state-changing events that were fired before.
 */

(function () {
  'use strict';
  window.Peerio = window.Peerio || {};

  // initial state
  Peerio.AppState = {
    loading: false,     // is app currently transferring/waiting for data
    connected: false,   // is app connected to peerio server socket
    navigationLevel: 0  // current view navigation level
  };

  // to make code shorter
  var s = Peerio.AppState;
  var d = Peerio.Dispatcher;

  function setState(prop, value) {
    this[prop] = value;
  }

  // subscribing to state-changing events
  d.onLoading(setState.bind(s, 'loading', true));
  d.onLoadingDone(setState.bind(s, 'loading', false));

  d.onSocketConnect(setState.bind(s, 'connected', true));
  d.onSocketDisconnect(setState.bind(s, 'connected', false));

  d.onNavigatedIn(function () {
    s.navigationLevel++;
  });

  d.onNavigatedOut(function () {
    s.navigationLevel--;
    if (s.navigationLevel < 0) throw new Error('Navigation level below 0');
  });

}());