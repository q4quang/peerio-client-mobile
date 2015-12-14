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

    Peerio.UI.Confirm = React.createClass({

        render: function () {

            var btns = this.props.btns || <div>
                    <div className="col-6">
                        <Peerio.UI.Tappable element="div" className="btn-lrg btn-danger" onTap={this.props.onClose}>Cancel</Peerio.UI.Tappable>
                    </div>
                    <div className="col-6">
                        <Peerio.UI.Tappable element="div" className="btn-lrg"
                                            onTap={this.handleAction}>OK</Peerio.UI.Tappable>
                    </div>
                </div>;

            var text = this.props.text || 'confirm text';

            return (
                <div>
                    <div className="modal alert text-center">
                        <div className="alert-content">
                            <div className="headline-lrg">
                                {this.props.headline}
                            </div>
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
        },
        handleAction: function () {
            this.props.onClose();
            this.props.onAccept();
        }
    });

    
}());