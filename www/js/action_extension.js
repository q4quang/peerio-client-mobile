/**
 * Adds mobile-specific AppState rules
 */

var Peerio = this.Peerio || {};

Peerio.ActionExtension = {};
Peerio.ActionExtension.init = function () {
  'use strict';

  [
    //------- ACTIONS EMITTED BY UI -------
    'SignOut',             // User wants to sign out
    'TabChange',           // Active tab changed to (index)
    'SidebarToggle',       // User wants to change show/hide state of sidebar
    'SwipeLeft',           // Global swipe left event detected by app root
    'SwipeRight',          // Global swipe right event detected by app root
    // Navigate* events allow opening nested views and navigating back from them(closing)
    // When calling NavigatedIn action, parameter can be passed to change "universal action button" in footer
    // If no parameters were passed - action button will remain the same.
    // When calling NavigatedOut "universal action button will be reverted to previous state"
    // NavigatedIn and Out are navigation change FACTS
    // NavigateBack - is a REQUEST that may lead to NavigatedOut
    'NavigatedIn',         // {Object{string actionName, function actionFn}} subview was opened (may be called several times sequentially)
    'NavigatedOut',        // subview was closed
    'NavigateBack',        // user wants to go back from subview
    'NewMessageViewOpen',  // open new message composition view requested
    'NewMessageViewClose', // open new message composition view requested
    'UploadFile',          // user wants to upload file
    'AddContact',          // user wants to add a new contact
    'TabBarShow',          // show tab bar requested
    'TabBarHide',          // show tab bar requested
    'SendCurrentMessage',  // user wants to send the message that he is currently typing
    'ShowFileSelect',      // {string[]} open file selector, optionally pass array of preselected file id's
    'FilesSelected',       // file selector was closed accepting selection
    //------- HARDWARE/OS ACTIONS
    'HardMenuButton',      // hardware "menu" button was pressed
    'HardBackButton',      // hardware "back" button was pressed
    'Pause',               // OS sent app to background
    'Resume'               // app was restored from background
  ].forEach(Peerio.Action.add);
};