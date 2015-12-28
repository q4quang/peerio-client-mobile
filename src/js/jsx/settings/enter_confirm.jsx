(function () {
    'use strict';

    Peerio.UI.EnterConfirm = React.createClass({
        mixins:[ReactRouter.Navigation],

        componentDidMount: function () {
            var element = React.findDOMNode(this.refs.textInput);
            element.focus(); //TODO: looks like it works on ios but not android.
        },

        removeDialog: function() {
            this.replaceWith('/app/settings/account');
        },

        cancel: function () {
            this.props.onCancel && this.props.onCancel(this.props.address, this.refs.textInput.getDOMNode().value);
            this.removeDialog();
        },

        ok: function () {
            this.props.onPrompt(this.props.address, this.refs.textInput.getDOMNode().value);
            this.removeDialog();
        },
        //--- RENDER
        render: function () {
            return (
                <div className="content-inline-dialog">
                    <div className="info-label">
                        Please enter the code you received on your e-mail or phone
                    </div>
                    <div>
                        <input 
                            className="txt-lrg text-center" 
                            ref="textInput" 
                            autoComplete="off" autoCorrect="off"
                            autoCapitalize="off" spellCheck="false">
                        </input>
                        <Peerio.UI.Tappable element="div" className="btn-lrg" 
                            onTap={this.ok}> 
                            Confirm 
                        </Peerio.UI.Tappable>
                        <Peerio.UI.Tappable element="div" className="btn-subtle" 
                            onTap={this.cancel}> 
                            Cancel
                        </Peerio.UI.Tappable>
                    </div>
                </div>
            );
        }
    });

}());
