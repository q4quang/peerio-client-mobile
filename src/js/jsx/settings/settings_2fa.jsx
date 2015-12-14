(function () {
    'use strict';

    Peerio.UI.Settings2FA = React.createClass({
        mixins:[ReactRouter.Navigation],

        getInitialState: function() {
            return {
                clipboardSuccess: false,
                code: '',
                isEnabled2FA: false,
                // used for the two step disabling 2FA process
                disable2FA: false,
                authyCode: '',
                message: ''
            };
        },

        updateFromSettings: function() {
            this.setState({ isEnabled2FA: Peerio.user.settings.settings.twoFactorAuth });
        },

        componentWillMount: function () {
            var self = this;
            this.updateFromSettings();
            if(!Peerio.user.settings.twoFactorAuth) this.startEnable2FA();
        },

        componentDidUpdate: function(prevProps, prevState) {
            if(!this.state.isEnabled2FA && prevState.isEnabled2FA)  {
                this.startEnable2FA();
            }
            if(!this.state.isEnabled2FA && prevState.code != this.state.code) {
                // we try to copy code to buffer
                // if we fail, we focus on the code input
                // to make it easier for user to copy
                // if we succeed, we focus on 
                // authenticator input
                var element = React.findDOMNode(this.refs.generatedCode);
                Peerio.NativeAPI.copyToClipboard(this.state.code)
                .then( () => {
                    this.setState( { clipboardSuccess: true } );
                    element = React.findDOMNode(this.refs.authenticatorCode);
                })
                .finally( () => {
                    element.focus();
                    element.select();
                });
            }
        },

        componentDidMount: function () {
            this.subscriptions = [
                Peerio.Dispatcher.onSettingsUpdated(this.updateFromSettings.bind(this))
            ];
        },

        componentWillUnmount: function () {
            Peerio.Dispatcher.unsubscribe(this.subscriptions);
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

        startEnable2FA: function() {
            if(!this.state.isEnabled2FA) {
                /* trying to get a new code right away */
                Peerio.Net.setUp2FA().then((response) => { 
                    L.info(response); 
                    var secret = response.secret;
                    this.setState( { code: secret, message: '' } );
                });
            }
        },

        enable2FA: function(currentCode) {
            Peerio.Net.confirm2FA(currentCode)
            .then( (response) => {
            })
            .catch( (reject) => {
                this.setState({message: 'Code is incorrect. Please try again.'});
            })
            .finally( () => {
                this.setState({ authyCode: '' });
            });
        },

        disable2FA: function(currentCode) {
            Peerio.Net.validate2FA( currentCode, Peerio.user.username, Peerio.user.publicKey )
            .then( () => {
                Peerio.Net.updateSettings( { twoFactorAuth: false } ).then( () => {
                });
            })
            .catch( (reject) => {
                this.setState({message: 'Code is incorrect. Please try again.'});
            })
            .finally( () => {
                this.setState({ authyCode: '' });
            });
        },

        startDisable2FA: function() {
            this.setState({
                disable2FA: true,
                message: ''
            });
        },
        //--- RENDER
        render: function () {
            var pasteMessage = this.state.clipboardSuccess ?
                'The following key has been copied to your clipboard. Please paste it in your authenticator app:' : 'Paste the following secret key into your authenticator app:';

                return (
                    <div className="content-padded no-scroll-hack">
                        <div className="info-label">Two Factor Authentication (2FA)</div>
                        <div>{ this.state.isEnabled2FA ? (
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
                            </div>)} { this.state.disable2FA || !this.state.isEnabled2FA ? (
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
                            <p className="info-small col-12"> 
                                {this.state.message}
                            </p>
                        </div>
                    </div>
                );
        }
    });

}());
