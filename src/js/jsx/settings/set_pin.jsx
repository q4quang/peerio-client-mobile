(function () {
    'use strict';

    var PIN_LENGTH = 6;

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

            //     .then(()=>Peerio.Action.showAlert({text: 'Your passcode has been removed'}))

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
            return this.state.newPin && this.state.newPin.length === PIN_LENGTH
            && Peerio.user.pinEntropyCheck(this.state.newPin);
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

            //   .then(() => Peerio.UI.Alert.show({text: 'Your passcode is set'}) )
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
                <div className="headline-md">Device passcode</div>
            );
            var pinIsSane = this.pinIsSane();
            var message = !this.state.newPin ?
                'please enter a distinct passcode' : (
                    (this.state.newPin.length && this.state.newPin.length != PIN_LENGTH) ?
                    (PIN_LENGTH - this.state.newPin.length) + ' more digits to go' :
                    (pinIsSane ? 'you\'re good to go' : 'passcode is too simple, try again'));

            var setPinButton = !this.state.inProgress && pinIsSane ? (

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
                    (<div>
                        <div className="input-group flex-col flex-justify-center">
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
                             <p className="info-small text-center"><b>{message}</b></p>
                        </div>
                        <div className="buttons">
                            {setPinButton}
                        </div>
                    </div>
                  );
            }

            return (
                <div>
                    {header}
                    <Peerio.UI.TalkativeProgress
                        enabled={this.state.inProgress}
                        showSpin="true" />
                    {pinUI}
                </div>

            );
        }
    });

}());
