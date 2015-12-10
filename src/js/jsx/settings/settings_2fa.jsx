(function () {
    'use strict';

    Peerio.UI.Settings2FA = React.createClass({
        mixins:[ReactRouter.Navigation],

        getInitialState: function() {
            return {
                clipboardSuccess: false,
                code: '',
                // used for the two step disabling 2FA process
                disable2FA: false,
                authyCode: ''
            };
        },

        isEnabled2FA: function() {
            return Peerio.user.settings.settings.twoFactorAuth;
        },

        componentWillMount: function () {
            var self = this;
            if(!this.isEnabled2FA()) {
                /* trying to get a new code right away */
                Peerio.Net.setUp2FA().then((response) => { 
                    L.info(response); 
                    var secret = response.secret;
                    self.setState( { code: secret } );
                    // we try to copy code to buffer
                    // if we fail, we focus on the code input
                    // to make it easier for user to copy
                    // if we succeed, we focus on 
                    // authenticator input
                    var element = React.findDOMNode(this.refs.generatedCode);
                    Peerio.NativeAPI.copyToClipboard(secret)
                    .then( () => {
                        this.setState( { clipboardSuccess: true } );
                        element = React.findDOMNode(this.refs.authenticatorCode);
                    })
                    .finally( () => {
                        element.focus();
                        element.select();
                    });
                });
            }
        },

        componentDidMount: function () {
            Peerio.Dispatcher.onSettingsUpdated(this.forceUpdate.bind(this, null));
        },

        onChangeAuthy: function () {
            var currentCode = this.state.authyCode;
            if( event.target.value.match(/^[0-9]*$/i) ) {
                currentCode = event.target.value;
            }

            this.setState({
                authyCode: currentCode
            });

            if(currentCode.length == 6) {
                this.state.disable2FA ?
                    this.disable2FA(currentCode) : this.enable2FA(currentCode);
            }
        },

        enable2FA: function(currentCode) {
            Peerio.Net.confirm2FA(currentCode)
            .then( (response) => {
                Peerio.Action.showAlert({text: '2FA is enabled successfully'});
            })
            .catch( (reject) => {
                Peerio.Action.showAlert({text: 'Code is incorrect. Please try again.'});
            })
            .finally( () => {
                this.setState({ authyCode: '' });
            });
        },

        disable2FA: function(currentCode) {
            Peerio.Net.validate2FA( currentCode, Peerio.user.username, Peerio.user.settings.publicKeyString )
            .then( () => {
                Peerio.Net.updateSettings( { twoFactorAuth: false } ).then( () => {
                    Peerio.Action.showAlert({text: '2FA is disabled successfully'});
                    this.setState({ disable2FA: false });
                });
            })
            .catch( (reject) => {
                Peerio.Action.showAlert({text: 'Code is incorrect. Please try again.'});
            })
            .finally( () => {
                this.setState({ authyCode: '' });
            });
        },

        startDisable2FA: function() {
            this.setState({
                disable2FA: true
            });
        },
        //--- RENDER
        render: function () {
            var pasteMessage = this.state.clipboardSuccess ?
                'The following key has been copied to your clipboard. Please paste it in your authenticator app:' : 'Paste the following secret key into your authenticator app:';

                return (
                    <div className="content-padded no-scroll-hack">
                        <div className="info-label">Two Factor Authentication (2FA)</div>
                        <div>{ this.isEnabled2FA() ? (
                            <div>
                                <Peerio.UI.Tappable element="div" className="btn-lrg" 
                                    onTap={this.startDisable2FA}> 
                                    Disable 2FA
                                </Peerio.UI.Tappable>
                            </div>
                            ) : (
                            <div>
                                <p className="info-small col-12"> 
                                    {pasteMessage}
                                </p>
                                <div className="text-center">{this.state.code ? (
                                    <input className="no-border full-width text-center" 
                                        ref="generatedCode" 
                                        autoComplete="off" autoCorrect="off"
                                        autoCapitalize="off" spellCheck="false"
                                        value={this.state.code} readOnly="true"/>
                                    ) : (
                                    <div>
                                        <i className="fa fa-circle-o-notch fa-spin"></i>
                                    </div>)}
                                </div>
                            </div>)} { this.state.disable2FA || !this.isEnabled2FA() ? (
                            <div>
                                <p className="info-small col-12"> 
                                    Enter the six digit code that appears in the app:
                                </p>
                                <input 
                                    className="txt-lrg text-center" 
                                    ref="authenticatorCode" 
                                    autoComplete="off" autoCorrect="off"
                                    autoCapitalize="off" spellCheck="false"
                                    onChange={this.onChangeAuthy}
                                    value={this.state.authyCode}/>
                            </div>) : null }
                        </div>
                    </div>
                );
        }
    });

}());
