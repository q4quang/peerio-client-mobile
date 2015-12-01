(function () {
    'use strict';

    Peerio.UI.SetPin = React.createClass({
        mixins:[ReactRouter.Navigation],

        getInitialState: function () {
            var user = Peerio.user;
            return {
                pinIsSet: user.PINIsSet
            };
        },

        removePinModal: function () {
            Peerio.Auth.removePIN();
            Peerio.Action.showAlert({text: 'Your PIN has been removed'});
            this.setState({ pinIsSet: false });
        },
        removePIN: function () {
            Peerio.Action.showConfirm({
                headline: 'Remove PIN',
                text: 'Are you sure you want to remove your PIN code?',
                onAccept: this.removePinModal
            });
        },

        setDevicePin: function() {
            var newPin = this.refs.newPinText.getDOMNode().value;
            if (!newPin) return;

            Peerio.Auth.setPIN(newPin, Peerio.user.username, Peerio.user.passphrase)
                .then(() => {
                    Peerio.Action.showAlert({text: 'Your PIN is set'});
                    this.setState({ pinIsSet: true });
                });
        },
        //--- RENDER
        render: function () {
            var pinUI = '';
            if (this.state.pinIsSet) {
                pinUI =
                    <div>
                        <Peerio.UI.Tappable
                        element="div"
                        className="btn-sm"
                        onTap={this.removePIN}>Remove existing PIN</Peerio.UI.Tappable>
                    </div>
                    ;
            } else {
                pinUI =
                    <div>
                        <input className="text-input text-center"
                               type="text" required="required" ref="newPinText" placeholder="Enter a device PIN"/>
                        <Peerio.UI.Tappable
                        element="div"
                        className="btn-sm"
                        onTap={this.setDevicePin}>Set new PIN</Peerio.UI.Tappable>
                    </div>
                    ;
            }

            return (
                <div className="content-padded">
                    <div className="info-label">Device PIN</div>
                    {pinUI}
                </div>
            );
        }
    });

}());