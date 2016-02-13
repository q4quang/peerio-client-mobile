(function () {
    'use strict';
    Peerio.UI.TouchId = React.createClass({
        statics: {
            keyname: function (username) {
                return (username ? username : Peerio.user.username) + '_keypair';
            },

            touchidname: function (username) {
                return (username ? username : Peerio.user.username) + '_touchid';
            },

            bubblename: function () {
                return Peerio.user.username + '_touch_bubble';
            },

            offername: function () {
                return Peerio.user.username + '_touch_offer';
            },

            hasTouchID: function (username) {
                return Peerio.TinyDB.getItem(Peerio.UI.TouchId.touchidname(username));
            },

            setHasTouchID: function (username, value) {
                return value ?
                    Peerio.TinyDB.saveItem(Peerio.UI.TouchId.touchidname(username), true) :
                    Peerio.TinyDB.removeItem(Peerio.UI.TouchId.touchidname(username));
            },

            hasUserSeenOffer: function () {
                return Peerio.TinyDB.getItem(Peerio.UI.TouchId.offername());
            },

            setUserSeenOffer: function () {
                return Peerio.TinyDB.saveItem(Peerio.UI.TouchId.offername(), true);
            },

            hasUserSeenBubble: function () {
                return Peerio.TinyDB.getItem(Peerio.UI.TouchId.bubblename());
            },

            setUserSeenBubble: function () {
                return Peerio.TinyDB.saveItem(Peerio.UI.TouchId.bubblename(), true);
            },

            showOfferIfNeeded: function () {
                Peerio.UI.TouchId.isFeatureAvailable()
                    .then(() => Peerio.UI.TouchId.hasUserSeenOffer())
                    .then((value) => {
                        if (value) return Promise.resolve(false);
                        Peerio.UI.Confirm.show({
                                text: 'Would you like to enable Touch ID?',
                                caption: 'Touch ID requires using your Apple Keychain'
                            })
                            .then(() => {
                                return Peerio.UI.TouchId.clearKeyPair()
                                .catch(() => true)
                                .then(() => Peerio.UI.TouchId.saveKeyPair());
                            })
                            .catch(() => true)
                            .then(() => Peerio.UI.TouchId.setUserSeenOffer());

                        return Promise.resolve(true);
                    })
                    .catch(err => L.silly(err));
            },

            showExclamationBubble: function () {
                return Peerio.UI.TouchId.hasUserSeenBubble()
                    .then((hasSeen) => {
                        return hasSeen ? Promise.resolve(true) :
                            Peerio.UI.Confirm.show({
                                text: 'Enabling TouchID requires using your keychain, would you like to proceed?'
                            });
                    })
                    .then(() => this.setUserSeenBubble());
            },

            getSystemPin: function (username) {
                return window.PeerioTouchIdKeychain.getValue(
                    Peerio.UI.TouchId.keyname(username));
            },

            enableTouchId: function () {
                return Peerio.UI.TouchId.clearKeyPair()
                    .catch((error) => L.info(error))
                    .then(() => Peerio.UI.TouchId.showExclamationBubble())
                    .then(() => Peerio.UI.TouchId.saveKeyPair());
            },

            saveKeyPair: function () {
                var systemPin = uuid.v4();
                return window.PeerioTouchIdKeychain.saveValue(
                    Peerio.UI.TouchId.keyname(),
                    systemPin
                    )
                    .then(() => Peerio.user.setPIN(systemPin, true))
                    .catch((error) => {
                        Peerio.UI.TouchId.setHasTouchID(Peerio.user.username, false);
                        return Promise.reject(error);
                    })
                    .then(() => Peerio.UI.TouchId.setHasTouchID(Peerio.user.username, true));
            },

            clearKeyPair: function () {
                return window.PeerioTouchIdKeychain.deleteValue(
                    Peerio.UI.TouchId.keyname())
                    .then(() => Peerio.UI.TouchId.setHasTouchID(Peerio.user.username, false));
            },

            isFeatureAvailable: function () {
                return window.PeerioTouchIdKeychain ?
                    window.PeerioTouchIdKeychain.isFeatureAvailable() : Promise.reject(false);
            }
        },

        getInitialState: function () {
            return {visible: false, enabled: false};
        },

        componentWillMount: function () {
            Peerio.UI.TouchId.isFeatureAvailable()
                .then(() => {
                    this.setState({visible: true});

                    Peerio.UI.TouchId.hasTouchID(Peerio.user.username)
                        .then((value) => this.setState({enabled: !!value}));

                    Peerio.NativeAPI.isForcefulFingerprintEnabled()
                        .then((value) => this.setState({fingerPrintWarning: value}));
                })
                .catch(() => {
                    L.info('Touch ID unavailable');
                });
        },

        enableTouchId: function () {
            var enabled = !this.state.enabled;
            enabled ? Peerio.UI.TouchId.enableTouchId()
                .then(() => {
                    this.setState({enabled: true});
                }) : Peerio.UI.TouchId.clearKeyPair()
                .then(() => {
                    this.setState({enabled: false});
                });
        },

        showFingerPrintWarning: function () {
            Peerio.Action.showAlert({
                headline: 'NOTE ON LAW ENFORCEMENT',
                text: 'In Oct. 2014, a USA court ruled that a police officer can demand you to unlock your device with a fingerprint but not an alphanumeric passcode. Similar laws may exist in other national or regional jurisdictions and should be considered if law enforcement is part of your threat model.'
            });
        },

        render: function () {

            return this.state.visible ? (
                <ul>
                    <li className="subhead">Touch ID</li>
                    <li>
                        <Peerio.UI.Tappable element="div" onTap={this.enableTouchId}
                                            className="flex-row">
                            <div type="checkbox" className={'checkbox-input' + (this.state.enabled
                              ? ' checked': '')}>
                                <i className="material-icons"/>
                            </div>
                            <div>Enable fingerprint key</div>
                        </Peerio.UI.Tappable>
                        { this.state.fingerPrintWarning ? (
                            <Peerio.UI.Tappable element="i" onTap={this.showFingerPrintWarning}
                                                className="material-icons">
                                info_outline
                            </Peerio.UI.Tappable>

                        ) : null }
                    </li>
                </ul>
            ) : (
                <ul>
                    <li className="subhead">Touch ID</li>
                    <li>Fingerprint identification unavailable</li>
                </ul>
            );
        }
    });
}());
