(function () {
    'use strict';

    Peerio.UI.Settings2FA = React.createClass({
        mixins:[ReactRouter.Navigation],

        componentDidMount: function () {
            var element = React.findDOMNode(this.refs.generatedCode);
            element.focus();
            element.select();
        },

        removeDialog: function() {
            // this.replaceWith('/app/settings/account');
        },

        cancel: function () {
            // this.props.onCancel(this.props.address, this.refs.textInput.getDOMNode().value);
            this.removeDialog();
        },

        ok: function () {
            // this.props.onPrompt(this.props.address, this.refs.textInput.getDOMNode().value);
            this.removeDialog();
        },
        //--- RENDER
        render: function () {
            return (
                <div className="content-padded no-scroll-hack">
                    <div className="info-label">Two Factor Authentication (2FA)</div>
                    <p className="info-small col-12"> 
                        Paste the following secret key into your authenticator app:
                    </p>
                   <div>
                        <input 
                            className="txt-lrg text-center no-border" 
                            ref="generatedCode" 
                            autoComplete="off" autoCorrect="off"
                            autoCapitalize="off" spellCheck="false"
                            value="EFAB101491901949" readonly="true"/>
                        <p className="info-small col-12"> 
                            Enter the code that appears in the app:
                        </p>
                        <input 
                            className="txt-lrg text-center" 
                            ref="authenticatorCode" 
                            autoComplete="off" autoCorrect="off"
                            autoCapitalize="off" spellCheck="false"
                            value="EFAB101491901949" readonly="true"/>
 
                        <Peerio.UI.Tappable element="div" className="btn-lrg" 
                            onTap={this.ok}> 
                            Confirm 
                        </Peerio.UI.Tappable>
                    </div>
                </div>
            );
        }
    });

}());
