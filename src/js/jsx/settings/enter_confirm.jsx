(function () {
    'use strict';

    Peerio.UI.EnterConfirm = React.createClass({
        mixins:[ReactRouter.Navigation],

        componentDidMount: function () {
            var element = React.findDOMNode(this.refs.textInput);
            //TODO: looks like it works on ios but not android.
            element && element.focus();
        },

        cancel: function () {
            this.props.onCancel(this.props.address, this.refs.textInput.getDOMNode().value);
        },

        ok: function () {
            this.props.onPrompt(this.props.address, this.refs.textInput.getDOMNode().value);
        },
        //--- RENDER
        render: function () {
            return !this.props.visible ? null : (
                <div className="content-inline-dialog">
                    <div className="headling-md">
                        Please enter the code you received on your e-mail or phone
                    </div>
                    <div>
                        <input
                            className="txt-lrg text-center"
                            ref="textInput"
                            autoComplete="off" autoCorrect="off"
                            autoCapitalize="off" spellCheck="false">
                        </input>
                        <Peerio.UI.Tappable element="div" className="btn-safe"
                            onTap={this.ok}>
                            Confirm
                        </Peerio.UI.Tappable>
                        <Peerio.UI.Tappable element="div" className="btn-danger"
                            onTap={this.cancel}>
                            Cancel
                        </Peerio.UI.Tappable>
                    </div>
                </div>
            );
        }
    });

}());
