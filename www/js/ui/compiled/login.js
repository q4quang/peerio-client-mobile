/**
 * Login Screen Component
 *
 */
(function () {
  'use strict';

  Peerio.UI.LoginScreen = React.createClass({displayName: "LoginScreen",
    //--- CONSTANTS
    // scalable passphrase font settings
    maxFontSize: 2.5,
    minFontSize: 1,
    // font scaling factor
    factor: 8,
    //--- REACT EVENTS
    getInitialState: function () {
      return {
        passphraseVisible: false,
        waitingForLogin: false, // to be able to disable buttons while login in progress
        loginError: false,
        loginState: ''
      };
    },
    componentWillMount: function () {
      Peerio.Dispatcher.onLoginProgress(this.handleLoginProgress);
      Peerio.Dispatcher.onLoginSuccess(this.handleLoginDone.bind(this, true));
      Peerio.Dispatcher.onLoginFail(this.handleLoginDone.bind(this, false));
    },
    componentWillUnmount: function () {
      Peerio.Dispatcher.unsubscribe(this.handleLoginProgress, this.handleLoginDone);
    },
    //--- CUSTOM FN
    handleLoginProgress: function (state) {
      this.setState({loginState: state});
    },
    handleLoginDone: function (success) {
      if(this.isMounted())
        this.setState({loginError: !success, waitingForLogin: false, loginState: ''});
    },
    // show/hide passphrase
    handlePassphraseShowTap: function (e) {
      this.setState({passphraseVisible: !this.state.passphraseVisible}, function () {
        var node = this.refs.passphrase.getDOMNode();
        if (!this.state.passphraseVisible) node.style.fontSize = '';
        this.handlePassphraseChange();
      });
      e.preventDefault();
    },
    // scale passphrase font
    handlePassphraseChange: function () {
      if (!this.state.passphraseVisible) return;

      var element = this.refs.passphrase.getDOMNode();
      var width = element.offsetWidth;
      element.style.fontSize = Math.max(
        Math.min(width / (element.value.length * this.factor), this.maxFontSize),
        this.minFontSize) + 'rem';
    },
    // initiate login
    handleSubmit: function (e) {
      if (e) e.preventDefault();
      // login already in progress
      if (this.state.waitingForLogin) return;
      this.setState({waitingForLogin: true});
      // we want to close mobile keyboard after user submits the login form
      var userNode = this.refs.username.getDOMNode();
      var passNode = this.refs.passphrase.getDOMNode();
      userNode.blur();
      passNode.blur();
      Peerio.NativeAPI.hideKeyboard();
      // TODO validate input
      Peerio.Data.login(userNode.value, passNode.value);
    },
    // submit form on enter
    handleKeyDown: function (e) {
      if (e.key === 'Enter') this.handleSubmit();
    },
    // close error alert
    handleAlertClose: function () {
      this.setState({loginError: false});
    },
    //--- RENDER
    render: function () {
      var eyeIcon = 'fa-' + (this.state.passphraseVisible ? 'eye-slash' : 'eye');
      var debugUserName = window.PeerioDebug ? window.PeerioDebug.user : '';
      var debugPassword = window.PeerioDebug ? window.PeerioDebug.pass : '';
      var passInputType = this.state.passphraseVisible ? 'text' : 'password';

      return (
        React.createElement("div", {id: "login-screen", className: "modal active"}, 

          React.createElement(Peerio.UI.Alert, {visible: this.state.loginError === true, onClose: this.handleAlertClose}, 
            "Invalid Username, Passphrase or PIN"
          ), 

          React.createElement("div", {id: "login-container"}, 
            React.createElement("img", {className: "logo", src: "media/img/peerio-logo-white.png", alt: "Peerio"}), 
            React.createElement("form", {className: "loginForm", onSubmit: this.handleSubmit}, 

              React.createElement("div", {className: "slim-input"}, 
                React.createElement("input", {defaultValue: debugUserName, id: "username", ref: "username", type: "text", maxLength: "16", 
                  autoComplete: "off", autoCorrect: "off", autoCapitalize: "off", spellCheck: "false"}), 
                React.createElement("label", {htmlFor: "username"}, "username")
              ), 

              React.createElement("div", {id: "passphrase-input", className: "slim-input"}, 
                React.createElement("div", null, 
                  React.createElement("input", {defaultValue: debugPassword, id: "password", ref: "passphrase", key: "passphrase", 
                    type: passInputType, onChange: this.handlePassphraseChange, onKeyDown: this.handleKeyDown, 
                    maxLength: "256", autoComplete: "off", autoCorrect: "off", autoCapitalize: "off", spellCheck: "false"}), 
                  React.createElement("label", {htmlFor: "password"}, "passphrase or pin"), 
                  React.createElement("i", {onTouchEnd: this.handlePassphraseShowTap, className: 'pull-right fa ' + eyeIcon})
                )
              ), 
              React.createElement("div", {id: "login-process-state"}, this.state.loginState), 
              React.createElement("button", {type: "submit", ref: "loginBtn", className: "login-btn", onTouchEnd: this.handleSubmit}, 
                this.state.waitingForLogin ? React.createElement("i", {className: "fa fa-circle-o-notch fa-spin"}) : 'login'
              ), 
              React.createElement("button", {type: "button", className: "signup-btn"}, "sign up")
            )
          )
        )
      );
    }
  });

}());
