(function () {
    'use strict';

    Peerio.UI.SetPassphrase = React.createClass({
        mixins:[ReactRouter.Navigation],

        getInitialState: function () {
            return {
                passphrase_valid: false
            };
        },

        componentDidMount: function () {
            var element = React.findDOMNode(this.refs.passPhraseInput);
            element.focus(); //TODO: looks like it works on ios but not android.
        },

        removeDialog: function() {
            this.replaceWith('/signup');
        },

        validatePassPhrase: function () {
            var passphrase_confirmed = event.target.value === this.props.passphrase;
            var passphrase_alert = event.target.value.length && !passphrase_confirmed;
            this.setState({
                passphrase_valid: passphrase_confirmed,
                passphrase_alert: passphrase_alert
            });
        },

        passPhraseIsValid: function () {
            if (this.state.passphrase_valid) {
                this.removeDialog();
                this.props.doSignup();
            } else {
                Peerio.Action.showAlert({text: 'Passphrases do not match'});
            }
        },
        //--- RENDER
        render: function () {
            var createPassPhrase = this.state.passphrase_valid ?
                (<Peerio.UI.Tappable element="div" className="btn-lrg" 
                    onTap={this.passPhraseIsValid}> 
                    Create my account
                </Peerio.UI.Tappable>) : null;
            var passphraseMsg = this.state.passphrase_alert && 'Passphrase does not match';

                    return (
                        <div className="content-inline-dialog">
                            <div className="info-label">Please enter the passphrase</div>
                            <div>
                                <textarea 
                                    className="txt-lrg textarea-transparent" 
                                    ref="passPhraseInput" 
                                    autoFocus="true" autoComplete="off" autoCorrect="off"
                                    autoCapitalize="off" spellCheck="false"
                                    onChange={this.validatePassPhrase}>
                                </textarea>
                                <p className="info-small text-center">{passphraseMsg}</p>
                                {createPassPhrase}
                                <Peerio.UI.Tappable element="div" className="btn-subtle" 
                                    onTap={this.removeDialog}> 
                                    Let me see my passphrase again
                                </Peerio.UI.Tappable>
                            </div>
                        </div>
                    );
        }
    });

}());
