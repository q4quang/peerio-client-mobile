/**
 * Adds mobile-specific AppState rules
 */

var Peerio = this.Peerio || {};

Peerio.ActionExtension = {};
Peerio.ActionExtension.init = function () {
  'use strict';

  [
    //------- ACTIONS EMITTED BY UI -------
    'ShowAlert',           // {text:string/reactComponent, btn: reactComponent} Message to modal manager to show alert
    'RemoveAlert',         // Message to modal manager to remove alert with ID
    'SignOut',             // User wants to sign out
    'TabChange',           // Active tab changed to (index)
    'SidebarToggle',       // User wants to change show/hide state of sidebar
    'SwipeLeft',           // Global swipe left event detected by app root
    'SwipeRight',          // Global swipe right event detected by app root
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