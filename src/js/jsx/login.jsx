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
                loginError: false
            };
        },
        componentWillMount: function () {
            Peerio.Dispatcher.onPause(this.cleanPassphrase);
            if (!Peerio.autoLogin) {
                Peerio.Auth.getSavedLogin()
                    .then(function (data) {
                        this.setState({savedLogin: data});
                    }.bind(this));
            }
        },
        componentWillUnmount: function () {
            Peerio.Dispatcher.unsubscribe(this.cleanPassphrase);
        },
        componentDidMount: function () {
            if (Peerio.autoLogin) {
                var autoLogin = Peerio.autoLogin;
                // in case smth fails we clean this first
                Peerio.autoLogin = null;
                this.refs.username.getDOMNode().value = autoLogin.username;
                this.refs.passphrase.getDOMNode().value = autoLogin.passphrase;
                this.handleSubmit();
            }
        },

        cleanPassphrase: function () {
            this.refs.passphrase.getDOMNode().value = '';
        },

        handleLoginSuccess: function () {
            Peerio.user.isMe = true;
            Peerio.Auth.saveLogin(Peerio.user.username, Peerio.user.firstName);
            Peerio.NativeAPI.enablePushNotifications(true);
            this.transitionTo('messages');
        },
        handleLoginFail: function (message) {
            L.error(message);
            Peerio.Action.showAlert({text: 'Login failed. Please check your username and passphrase/PIN.' + (message ? (' Error message: ' + message) : '')});
            this.setState({waitingForLogin: false});
        },
        // show/hide passphrase
        handlePassphraseShowTap: function () {
            this.setState({passphraseVisible: !this.state.passphraseVisible}, function () {
                var node = this.refs.passphrase.getDOMNode();
                if (!this.state.passphraseVisible) node.style.fontSize = '';
                this.handlePassphraseChange();
            });
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
            Peerio.user = Peerio.User(userNode.value);
            Peerio.user.login(passNode.value)
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
                        <img className="logo" src="media/img/peerio-logo-white.png" alt="Peerio"
                             onTouchEnd={devmode.summon}/>

                        <form className="loginForm" onSubmit={this.handleSubmit}>
                            {this.state.savedLogin
                                ?
                                (<Peerio.UI.Tappable element="div" className="saved-login"
                                                     onTap={this.clearLogin}>{this.state.savedLogin.firstName || this.state.savedLogin.username}
                                    <div className="note">Welcome back.
                                        <br/>
                                        Tap here to change or forget username.
                                    </div>
                                </Peerio.UI.Tappable>)
                                :
                                (<div className="slim-input">
                                    <input defaultValue={debugUserName} id="username" ref="username"
                                           onKeyDown={this.handleKeyDownLogin} type="text" maxLength="16"
                                           autoComplete="off" autoCorrect="off" autoCapitalize="off"
                                           spellCheck="false"/>

                                    <div>
                                        <label htmlFor="username">username</label>
                                    </div>
                                </div>)
                                }
                            <div id="passphrase-input" className="slim-input">
                                <div>
                                    <input defaultValue={debugPassword} id="password" ref="passphrase" key="passphrase"
                                           type={passInputType} onChange={this.handlePassphraseChange}
                                           onKeyDown={this.handleKeyDownPass}
                                           maxLength="256" autoComplete="off" autoCorrect="off" autoCapitalize="off"
                                           spellCheck="false"/>
                                    <label htmlFor="password">passphrase or pin</label>
                                    <Peerio.UI.Tappable onTap={this.handlePassphraseShowTap}>
                                        <i className={'pull-right fa ' + eyeIcon}></i>
                                    </Peerio.UI.Tappable>
                                </div>
                            </div>
                            <div id="login-process-state">
                                <Peerio.UI.TalkativeProgress
                                    enabled={this.state.waitingForLogin}/>
                            </div>
                            <Peerio.UI.Tappable element="div" ref="loginBtn" className="btn-lrg btn-safe"
                                                onTap={this.handleSubmit}>
                                {this.state.waitingForLogin ?
                                <i className="fa fa-circle-o-notch fa-spin"></i> : 'login'}
                            </Peerio.UI.Tappable>

                            {this.state.waitingForLogin
                                ? null
                                : (<Peerio.UI.Tappable element="div" className="btn-lrg"
                                                       onTap={this.transitionTo.bind(this,'signup')}>
                                sign up
                            </Peerio.UI.Tappable>)}

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
