/**
 * Login Screen Component
 *
 */
(function () {
  'use strict';

  Peerio.UI.Login = React.createClass({
    mixins: [ReactRouter.Navigation],
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
        waitingForLogin: false,
        loginError: false,
        loginProgressMsg: ''
      };
    },
    componentWillMount: function () {
      Peerio.Dispatcher.onLoginSuccess(this.handleLoginSuccess);
      Peerio.Dispatcher.onLoginFail(this.handleLoginFail);
      Peerio.Auth.getSavedLogin()
        .then(function (data) {
          this.setState({savedLogin: data });
        }.bind(this));
    },
    componentWillUnmount: function () {
      Peerio.Dispatcher.unsubscribe(this.handleLoginProgress, this.handleLoginDone);
    },
    //--- CUSTOM FN
    progressMessages: [
      'greeting server...',
      'securing bits...',
      'checking bytes...',
      'hiding tracks...',
      'moving keys...',
      'increasing entropy...',
      'adding awesomeness...',
      'scaring NSA away...',
      'inventing algorithms...',
      'reading ciphertext...',
      'settling checksums...',
      'warming up...',
      'cooling down...'],
    updateProgressMessage: function () {
      var ind = Math.floor(Math.random() * this.progressMessages.length);
      this.setState({loginProgressMsg: this.progressMessages[ind]});
    },
    startProgress: function () {
      this.progressInterval = window.setInterval(this.updateProgressMessage, 1000);
    },
    stopProgress: function () {
      window.clearInterval(this.progressInterval);
    },
    handleLoginSuccess: function () {
      Peerio.Auth.saveLogin(Peerio.user.username, Peerio.user.firstName);
      this.stopProgress();
      console.log('login success');
      this.transitionTo('messages');
    },
    handleLoginFail: function (message) {
      this.stopProgress();
      Peerio.Action.showAlert({text: (typeof message !== "undefined" && message.toString()) || 'Login failed.'});
      this.setState({waitingForLogin: false, loginProgressMsg: ''});
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

      if (this.state.waitingForLogin) return;
      this.setState({waitingForLogin: true});
      this.startProgress();
      // getting login from input or from previously saved data
      var userNode;
      if (this.state.savedLogin) {
        userNode = {value: this.state.savedLogin.username};
      } else {
        userNode = this.refs.username.getDOMNode();
        userNode.blur();
      }

      // getting passphrase
      var passNode = this.refs.passphrase.getDOMNode();
      passNode.blur();
      // hiding software keyboard
      Peerio.NativeAPI.hideKeyboard();
      // TODO validate input
      Peerio.Auth.login(userNode.value, passNode.value)
        .then(this.handleLoginSuccess)
        .catch(this.handleLoginFail);
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
    clearLogin: function () {
      this.setState({savedLogin: null});
      Peerio.Auth.clearSavedLogin();
    },
    //--- RENDER
    render: function () {
      var eyeIcon = 'fa-' + (this.state.passphraseVisible ? 'eye-slash' : 'eye');
      var debugUserName = window.PeerioDebug ? window.PeerioDebug.user : '';
      var debugPassword = window.PeerioDebug ? window.PeerioDebug.pass : '';
      var passInputType = this.state.passphraseVisible ? 'text' : 'password';

      return (
        <div className="page-wrapper-login">

          <div className="content-wrapper-login">
            <div className="app-version">Peerio version: {Peerio.NativeAPI.getAppVersion()}</div>
            <img className="logo" src="media/img/peerio-logo-white.png" alt="Peerio"/>

            <form className="loginForm" onSubmit={this.handleSubmit}>
              {this.state.savedLogin
                ?
                (<div className="saved-login"
                      onTouchEnd={this.clearLogin}>{this.state.savedLogin.firstName || this.state.savedLogin.username}
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
                  <Peerio.UI.Tappable onTap={this.handlePassphraseShowTap}>
                    <i className={'pull-right fa ' + eyeIcon}></i>
                  </Peerio.UI.Tappable>
                </div>
              </div>
              <div id="login-process-state">{this.state.loginProgressMsg}</div>
              <button type="submit" ref="loginBtn" className="btn-lrg btn-safe">
                {this.state.waitingForLogin ? <i className="fa fa-circle-o-notch fa-spin"></i> : 'login'}
              </button>

              <button type="button" className="btn-lrg" onTouchEnd={this.transitionTo.bind(this,'signup')}>sign up
              </button>
              <div className="text-input-group">
                <label className="info-label col-4" htmlFor="language-select">Language:</label>
                <select id="language-select" className="select-input col-8">
                  <option value="">english</option>
                </select>
              </div>
            </form>
          </div>
        </div>
      );
    }
  });

}());
