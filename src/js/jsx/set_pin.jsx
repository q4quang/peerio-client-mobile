(function () {
    'use strict';

    Peerio.UI.SetPin = React.createClass({
        mixins:[ReactRouter.Navigation],

        getInitialState: function () {
            var user = Peerio.user;
            return {
                pinIsSet: user.PINIsSet,
                inProgress: false,
                progressMsg: ''
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

        progressMessages: [
            'do you like whisky?',
            'making sun shine brighter...',
            'getting Daenerys closer to Westeros...',
            'calculating the width of a unicorn hair...',
            '42!',
            'are you gonna finish the dessert?',
            'processing ciphertext...',
            'some unparallelizable code...',
            'mathing...',
            'taking a quick break...',
            'are those new shoes?',
            '...',
            'you\'re looking sharp',
            'that\'s a gorgeous haircut',
            'I think you would like Alice...',
            'I think you would like Bob...'
        ],

        updateProgressMessage: function () {
            var ind = Math.floor(Math.random() * this.progressMessages.length);
            this.setState({progressMsg: this.progressMessages[ind]});
        },
        startProgress: function () {
            this.setState({ inProgress: true });
            this.updateProgressMessage();
            this.progressInterval = window.setInterval(this.updateProgressMessage, 1800);
        },
        stopProgress: function () {
            window.clearInterval(this.progressInterval);
            this.setState({ inProgress: false });
        },
        setDevicePin: function() {
            var newPin = this.refs.newPinText.getDOMNode().value;
            if (!newPin) return;
            this.startProgress();
            var self = this;

            Peerio.Auth.setPIN(newPin, Peerio.user.username, Peerio.user.passphrase)
                .then(() => {
                    Peerio.Action.showAlert({text: 'Your PIN is set'});
                    self.setState({ pinIsSet: true });
                }).finally( function() {
                    self.stopProgress();
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
                    { this.state.inProgress ?
                    <div className="text-center">
                        <div>Setting pin</div>
                        <div><i className="fa fa-circle-o-notch fa-spin"></i></div>
                        <div>{this.state.progressMsg}</div>
                    </div> : null }
                    {pinUI}
                </div>
            );
        }
    });

}());
