/**
 * This is a custom alert component, which is a test of how React portals work.
 *
 * This to universal alert/prompt/confirm component,
 * it communicates through Peerio Actions and allows multiple alerts
 * active at the same time.
 *
 * Using it as a normal (non-portal) React component is not a good idea
 * because it creates strange problems with z-index on iOS WebView,
 * and it will be hard to layer multiple alerts properly.
 *
 */

(function () {
    'use strict';

    Peerio.UI.Prompt = React.createClass({
        statics: {
            show: function(params) {
                return new Promise( (resolve, reject) => {
                    params.onAccept = resolve;
                    params.onCancel = reject;
                    Peerio.Action.showPrompt(params);
                });
            }
        },
        getInitialState: function () {
            return {promptValue: this.props.promptValue};
        },
        updatePromptValue: function (event) {
            this.setState({promptValue: event.target.value});
        },
        isValueValid: function() {
            return (this.props.minLength > 0) == 
                (this.state.promptValue && this.state.promptValue.length >= this.props.minLength);
        },
        componentDidMount: function () {
            var input = this.refs.promptInput.getDOMNode();
            input.focus();
        },
        render: function () {
            var btns = this.props.btns || <div>
                    <div className="col-6">
                        <Peerio.UI.Tappable element="div" className="btn-lrg btn-danger" onTap={this.handleCancel}>Cancel</Peerio.UI.Tappable>
                    </div>
                    <div className="col-6">
                        <Peerio.UI.Tappable 
                            element="div" 
                            className={'btn-lrg ' + (this.isValueValid() ? null : 'btn-subtle')}
                            onTap={this.isValueValid() ? this.handleAction : null}>OK</Peerio.UI.Tappable>
                    </div>
                </div>;

            var text = this.props.text || 'confirm text';
            var inputType = this.props.inputType || 'text';
            return (
                <div>
                    <div className="modal alert text-center">
                        <div className="alert-content">
                            <div className="headline-lrg">
                                {this.props.headline}
                            </div>
                            <div className="alert-content-text">
                                {text}
                                <input type={inputType} className="text-input centered-text" ref="promptInput"
                                       autoCorrect="off" autoCapitalize="off" spellCheck="false"
                                       value={this.state.promptValue} onChange={this.updatePromptValue}/>
                            </div>
                            <div className="alert-content-btns">
                                {btns}
                            </div>
                        </div>
                    </div>
                    <div className="modal dim-background"></div>
                </div>
            );
        },

        handleCancel: function(ev) {
            this.props.onClose();
            this.props.onCancel && this.props.onCancel('user pressed cancel');
        },

        handleAction: function (ev) {
            this.props.onClose();
            this.props.onAccept && this.props.onAccept(this.state.promptValue);
        }
    });

}());
