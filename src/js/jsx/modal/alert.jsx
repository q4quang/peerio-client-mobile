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

    Peerio.UI.Alert = React.createClass({
        statics: {
            show: function(params) {
                return new Promise( (resolve, reject) => {
                    params.onAccept = resolve;
                    Peerio.Action.showAlert(params);
                });
            }
        },

        handleAction: function() {
            this.props.onClose();
            this.props.onAccept && this.props.onAccept();
        },

        render: function () {

            var btns = this.props.btns ||
                (<div>
                    <Peerio.UI.Tappable element="div" className="btn-safe"
                                        onTap={this.handleAction}>OK</Peerio.UI.Tappable>
                </div>);

            var text = this.props.text || '';

            return (
                <div>
                    <div className="modal alert text-center">
                        <div className="alert-content">
                            <div className="alert-content-text">
                                {text}
                            </div>
                            <div className="alert-content-btns">
                                {btns}
                            </div>
                        </div>
                    </div>
                    <div className="modal dim-background"></div>
                </div>
            );
        }
    });

}());
