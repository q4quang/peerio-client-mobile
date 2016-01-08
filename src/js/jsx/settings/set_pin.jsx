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
                .then(()=>Peerio.Action.showAlert({text: 'Your passcode has been removed'}))
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
            return this.state.newPin && this.state.newPin.length > 5;
        },

        newPinChange: function (event) {
            this.setState({newPin: event.target.value});
        },

        setDevicePin: function () {
            var newPin = this.state.newPin;
            if (!newPin) return;
            var self = this;
            self.setState({inProgress: true});
            Peerio.user.setPIN(newPin)
                .then(() => Peerio.UI.Alert.show({text: 'Your passcode is set'}) )
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
                <div className="info-label">Device passcode</div>
            );
            var setPinButton = !this.state.inProgress && this.pinIsSane() ? (
                <Peerio.UI.Tappable
                    element="div"
                    className="btn-sm"
                    onTap={this.setDevicePin}>Set device passcode</Peerio.UI.Tappable>
            ) : null;
            if (Peerio.user.PINIsSet) {
                pinUI =
                    (<div>
                        <Peerio.UI.Tappable
                            element="div"
                            className="btn-sm"
                            onTap={this.removePIN}>Remove existing passcode</Peerio.UI.Tappable>
                    </div>);
            } else {
                pinUI =
                    (<div>
                        <p className="info-small italic">
                            Passcode must be 6 digits or longer
                        </p>
                        <input className="text-input text-center"
                               type="password" required="required" ref="textEdit"
                               placeholder="Enter a device passcode"
                               pattern="[0-9]*"
                               value={this.state.newPin}
                               inputmode="numeric"
                               onChange={this.newPinChange}
                        />
                        {setPinButton}
                    </div>);
            }

            return (
                <div className="content-padded without-tab-bar">
                    {header}
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
