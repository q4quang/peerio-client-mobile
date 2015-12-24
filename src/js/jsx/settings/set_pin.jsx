(function () {
    'use strict';

    Peerio.UI.SetPin = React.createClass({
        mixins:[ReactRouter.Navigation],

        getInitialState: function () {
            var user = Peerio.user;
            return {
                pinIsSet: user.PINIsSet,
                inProgress: false,
                newPin: null
            };
        },

        componentDidMount: function() {
            if(!this.state.pinIsSet) {
                this.refs.newPinText.getDOMNode().focus();
            }
        },

        removePinModal: function () {
            Peerio.Auth.removePIN(Peerio.user.username);
            Peerio.Action.showAlert({text: 'Your PIN has been removed'});
            this.setState({ pinIsSet: false });
            Peerio.user.PINIsSet = false;
        },
        removePIN: function () {
            Peerio.Action.showConfirm({
                headline: 'Remove PIN',
                text: 'Are you sure you want to remove your PIN code?',
                onAccept: this.removePinModal
            });
        },

        pinIsSane: function() {
            return this.state.newPin && this.state.newPin.length > 5;
        },

        newPinChange: function(event) {
            this.setState({ newPin: event.target.value });
        },

        setDevicePin: function() {
            var newPin = this.state.newPin;
            if (!newPin) return;
            var self = this;
            self.setState({ inProgress: true });
            Peerio.Auth.setPIN(newPin, Peerio.user.username, Peerio.user.passphrase)
                .then(() => {
                    Peerio.Action.showAlert({text: 'Your PIN is set'});
                    self.setState({ pinIsSet: true });
                    Peerio.user.PINIsSet = true;
                }).finally( function() {
                    self.setState({ inProgress: false });
                });
        },
        //--- RENDER
        render: function () {
            var pinUI = '';
            var setPinButton = !this.state.inProgress && this.pinIsSane() ? (
                        <Peerio.UI.Tappable
                        element="div"
                        className="btn-sm"
                        onTap={this.setDevicePin}>Set new PIN</Peerio.UI.Tappable>
            ) : null;
            if (this.state.pinIsSet) {
                pinUI =
                    (<div>
                        <Peerio.UI.Tappable
                        element="div"
                        className="btn-sm"
                        onTap={this.removePIN}>Remove existing PIN</Peerio.UI.Tappable>
                    </div>);
            } else {
                pinUI =
                    (<div>
                        <p className="info-small col-12">
                        The PIN should be at least 6 digits length
                        </p>
                        <input className="text-input text-center"
                               type="number" required="required" ref="newPinText" 
                               placeholder="Enter a device PIN"
                               pattern="[0-9]*"
                               value={this.state.newPin}
                               onChange={this.newPinChange}
                               />
                        {setPinButton}
                    </div>);
            }

            return (
                <div className="content-padded">
                    <div className="info-label">Device PIN</div>

                    <Peerio.UI.TalkativeProgress
                        enabled={this.state.inProgress}
                        showSpin="true"
                        />
                    {pinUI}
                </div>
            );
        }
    });

}());
