(function () {
    'use strict';

    Peerio.UI.SetPin = React.createClass({
        mixins: [ReactRouter.Navigation, Peerio.UI.AutoFocusMixin],

        getInitialState: function () {
            return {
                inProgress: false,
                newPin: null
            };
        },

        removePinModal: function () {
            Peerio.user.removePIN()
                .catch(()=>Peerio.Action.showAlert({text: 'Failed to remove passcode'}))
                .finally(()=>this.forceUpdate());
        },
        removePIN: function () {
            Peerio.Action.showConfirm({
                headline: 'Remove passcode',
                text: 'Are you sure you want to remove your passcode?',
                onAccept: this.removePinModal
            });
        },

        pinIsSane: function () {
            return this.state.newPin && this.state.newPin.length === 6;
        },

        newPinChange: function (event) {
            if(event.target.value.length > Peerio.UI.PinInput.getPinLength()) return;
            this.setState({newPin: event.target.value});
        },

        setDevicePin: function () {
            var newPin = this.state.newPin;
            if (!newPin) return;
            var self = this;
            self.setState({inProgress: true});
            Peerio.user.setPIN(newPin)
                .then(() => {
                    if(this.props.onSuccess) this.props.onSuccess();
                })
                .finally(function () {
                    self.setState({inProgress: false});
                });
        },
        //--- RENDER
        render: function () {
            var pinUI = '';
            var header = !!this.props.hideHeader ? null : (
                <div className="headline">Device passcode</div>
            );
            var setPinButton = !this.state.inProgress && this.pinIsSane() ? (
                <Peerio.UI.Tappable
                    element="div"
                    className="btn-safe"
                    onTap={this.setDevicePin}>Set device passcode</Peerio.UI.Tappable>
            ) : null;
            if (Peerio.user.PINIsSet) {
                pinUI =
                    (<div className="buttons">
                        <Peerio.UI.Tappable
                            element="div"
                            className="btn-danger"
                            onTap={this.removePIN}>Remove passcode</Peerio.UI.Tappable>
                    </div>);
            } else if(!this.state.inProgress) {
                pinUI =
                    (<div className="input-group flex-col flex-justify-center">
                        <label>
                            Passcode must be 6 digits
                        </label>
                        <input className="text-center"
                               type="number" required="required" ref="textEdit"
                               data-password="yes"
                               placeholder="Enter a device passcode"
                               pattern="[0-9]*"
                               value={this.state.newPin}
                               inputmode="numeric"
                               onChange={this.newPinChange}/>
                    </div>);
            }

            return (
                <div className="content without-tab-bar">
                    {header}
                    <Peerio.UI.TalkativeProgress
                        enabled={this.state.inProgress}
                        showSpin="true"
                    />

                    {pinUI}
                    <div className="buttons">
                      {setPinButton}
                    </div>
                </div>

            );
        }
    });

}());
