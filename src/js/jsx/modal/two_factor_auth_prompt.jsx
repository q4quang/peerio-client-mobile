(function () {
    'use strict';

    Peerio.UI.TwoFactorAuthPrompt = React.createClass({
        mixins:[ReactRouter.Navigation],

        getInitialState: function() {
            return {
                authyCode: '',
                message: ''
            };
        },

        focusInput: function() {
            var element = React.findDOMNode(this.refs.authenticatorCode);
            element.focus();
        },

        componentWillMount: function () {
        },

        componentDidUpdate: function(prevProps, prevState) {
            this.focusInput();
        },

        componentDidMount: function () {
            this.focusInput();
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
                Peerio.Net.
                    validate2FA( currentCode, 
                                Peerio.user.username, 
                                Peerio.user.publicKey )
                                .then( () => {
                                    Peerio.Action.twoFactorAuthResend();

                                    // TODO: move this logic to event handlers
                                    Peerio.Net.retryCached2FARequest();
                                    this.removeDialog();

                                    // TODO: replace this with gloval action/event 
                                    if(this.props.on2FA) {
                                        this.props.on2FA();
                                    }
                                })
                                .catch( () => {
                                    this.setState({
                                        authyCode: '',
                                        message: 'Code is incorrect. Please try again'
                                    });
                                });
            }
        },

        removeDialog: function() {
            this.goBack();
        },

        //--- RENDER
        render: function () {
            var pasteMessage = this.state.clipboardSuccess ?
                'The following key has been copied to your clipboard. Please paste it in your authenticator app:' : 'Paste the following secret key into your authenticator app:';

                return (
                    <div className="content-inline-dialog no-scroll-hack">
                        <div className="info-label">Two Factor Authentication (2FA)</div>
                        <div>   
                            <div>
                                <p className="info-small col-12"> 
                                    The operation you requested is 
                                    protected by 2FA. Please enter the six digit 
                                    code that appears in the authenticator app:
                                </p>
                                <input 
                                    className="txt-lrg text-center" 
                                    ref="authenticatorCode" 
                                    autoComplete="off" autoCorrect="off"
                                    autoCapitalize="off" spellCheck="false"
                                    onChange={this.onChangeAuthy}
                                    value={this.state.authyCode}/>
                            </div>
                            <p className="info-small col-12"> 
                                {this.state.message}
                            </p>
                            <Peerio.UI.Tappable element="div" className="btn-subtle" 
                                onTap={this.removeDialog}> 
                                Cancel
                            </Peerio.UI.Tappable>
                        </div>
                    </div>
                );
        }
    });

}());
