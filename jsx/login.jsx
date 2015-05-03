/**
 * Login Screen Component
 *
 */
(function () {
  'use strict';

  Peerio.UI.LoginScreen = React.createClass({
    //--- CONSTANTS
    // scalable passphrase font settings
    maxFontSize: 2,
    minFontSize: 1.3,
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
      Peerio.Data.getLastLogin()
        .then(function (login) {
          this.setState({savedLogin: login});
        }.bind(this)).catch(function () {
          this.setState({savedLogin: null});
        }.bind(this));
    },
    componentWillUnmount: function () {
      Peerio.Dispatcher.unsubscribe(this.handleLoginProgress, this.handleLoginDone);
    },
    //--- CUSTOM FN
    handleLoginProgress: function (state) {
      this.setState({loginState: state});
    },
    handleLoginDone: function (success, message) {
      Peerio.Data.setLastLogin(Peerio.user.username);
      if (this.isMounted())
        this.setState({loginError: success ? false : message, waitingForLogin: false, loginState: ''});
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
      // todo: multiple login call is not ui's concern, move it from here
      // login already in progress
      if (this.state.waitingForLogin) return;
      this.setState({waitingForLogin: true});
      // we want to close mobile keyboard after user submits the login form
      var userNode;
      if (this.state.savedLogin) {
        userNode = {value: this.state.savedLogin};
      } else {
        userNode = this.refs.username.getDOMNode();
        userNode.blur();
      }
      var passNode = this.refs.passphrase.getDOMNode();
      passNode.blur();
      Peerio.NativeAPI.hideKeyboard();
      // TODO validate input
      Peerio.Data.login(userNode.value, passNode.value);
    },
    // change focus to passphrase input on enter
    handleKeyDownLogin: function (e) {
      if (e.key === 'Enter') {
        this.refs.passphrase.getDOMNode().focus();
        e.preventDefault();
      }
    },
    // submit form on enter
    handleKeyDownPass: function (e) {
      if (e.key === 'Enter') this.handleSubmit();
    },
    // close error alert
    handleAlertClose: function () {
      this.setState({loginError: false});
    },
    clearLogin: function () {
      this.setState({savedLogin: null});
      Peerio.Data.setLastLogin('');
    },
    //--- RENDER
    render: function () {
      var eyeIcon = 'fa-' + (this.state.passphraseVisible ? 'eye-slash' : 'eye');
      var debugUserName = window.PeerioDebug ? window.PeerioDebug.user : '';
      var debugPassword = window.PeerioDebug ? window.PeerioDebug.pass : '';
      var passInputType = this.state.passphraseVisible ? 'text' : 'password';

      return (
        <div id="login-screen" className="modal active">

          <Peerio.UI.Alert visible={!!this.state.loginError} onClose={this.handleAlertClose}>
            {this.state.loginError}
          </Peerio.UI.Alert>

          <div id="login-container">
            <div className="app-version">Peerio version: {Peerio.NativeAPI.getAppVersion()}</div>
            <img className="logo" src="media/img/peerio-logo-white.png" alt="Peerio"/>

            <form className="loginForm" onSubmit={this.handleSubmit}>
              {this.state.savedLogin
                ?
                (<div className="saved-login" onTouchEnd={this.clearLogin}>{this.state.savedLogin}
                  <div className="note">Welcome back.
                    <br/>
                    Tap here to change or forget username.
                  </div>
                </div>)
                :
                (<div className="slim-input">
                  <input defaultValue={debugUserName} id="username" ref="username"
                         onKeyDown={this.handleKeyDownLogin} type="text" maxLength="16"
                         autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"/>

                  <div>
                    <label htmlFor="username">username</label>
                  </div>
                </div>)
              }
              <div id="passphrase-input" className="slim-input">
                <div>
                  <input defaultValue={debugPassword} id="password" ref="passphrase" key="passphrase"
                         type={passInputType} onChange={this.handlePassphraseChange} onKeyDown={this.handleKeyDownPass}
                         maxLength="256" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"/>
                  <label htmlFor="password">passphrase or pin</label>
                  <i onTouchEnd={this.handlePassphraseShowTap} className={'pull-right fa ' + eyeIcon}></i>
                </div>
              </div>
              <div id="login-process-state">{this.state.loginState}</div>
              <button type="submit" ref="loginBtn" className="login-btn" onTouchEnd={this.handleSubmit}>
                {this.state.waitingForLogin ? <i className="fa fa-circle-o-notch fa-spin"></i> : 'login'}
              </button>
              <button type="button" className="signup-btn">sign up</button>
            </form>
          </div>
        </div>
      );
    }
  });

}());
