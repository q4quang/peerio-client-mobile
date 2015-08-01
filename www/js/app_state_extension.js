/**
 * Adds mobile-specific AppState rules
 */

var Peerio = this.Peerio || {};

Peerio.AppStateExtension = {};
Peerio.AppStateExtension.init = function () {
  'use strict';

  Peerio.AppState.navigationLevel = 0;
  Peerio.AppState.addStateTrigger('NavigatedIn', function () {
    s.navigationLevel++;
  });
  Peerio.AppState.addStateTrigger('NavigatedOut', function () {
    s.navigationLevel--;
    if (s.navigationLevel < 0) throw new Error('Navigation level below 0');
  });
};