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
            this.setState({
                passphrase_valid: passphrase_confirmed
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
                <Peerio.UI.Tappable element="div" className="btn-lrg" 
                    onTap={this.passPhraseIsValid}> 
                    Create my account
                </Peerio.UI.Tappable>
                    : null;

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
