/**
 * Adds mobile-specific AppState rules
 */

var Peerio = this.Peerio || {};

Peerio.ActionExtension = {};
Peerio.ActionExtension.init = function () {
    'use strict';

    [
        //------- ACTIONS EMITTED BY UI -------
        'BigGreenButton',      // universal context-dependent big green button tapped
        'ShowAlert',           // {[id]:, text:string/reactComponent, btn: reactComponent} Message to modal manager to show alert
        'ShowConfirm',
        'ShowPrompt',
        'ShowContactSelect',   // {[id]:, preselected:['username','username' ]}
        'ContactsSelected',    // {['username', 'username']} - contacts was selected and accepted in contacts selector
        'ShowFileSelect',      // {string[]} open file selector, optionally pass array of preselected file id's
        'ShowFileUpload',      //
        'FilesSelected',       // file selector was closed accepting selection
        'RemoveModal',         // Message to modal manager to remove alert with ID
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
        'TransitionTo',        // a hack to allow out of router context components to navigate
        //------- HARDWARE/OS ACTIONS
        'HardMenuButton',      // hardware "menu" button was pressed
        'HardBackButton',      // hardware "back" button was pressed
        'Pause',               // OS sent app to background
        'Resume',              // app was restored from background
        'ViewShrink',          // webview changes height. arg {keyboardHeight:0}. 0 means view is stretching back to normal
        'KeyboardWillShow',
        'KeyboardDidShow',
        'KeyboardWillHide',
        'KeyboardDidHide'
    ].forEach(Peerio.Action.add);
};