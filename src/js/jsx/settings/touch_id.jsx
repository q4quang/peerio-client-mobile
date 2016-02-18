(function () {
    'use strict';

    var touchIdName = 'touchid';
    var keyName = 'keypair';
    var bubbleName = 'touch_bubble';
    var offerName = 'touch_offer';

    function keychainName(username) {
        return (username || Peerio.user.username) + '_' +keyName;
    };

    Peerio.UI.TouchId = React.createClass({
        statics: {
            hasTouchID: function (username) {
                return Peerio.TinyDB.getItem(touchIdName, username || Peerio.user.username);
            },

            setHasTouchID: function (username, value) {
                return value ?
                    Peerio.TinyDB.saveItem(touchIdName, true, username || Peerio.user.username) :
                    Peerio.TinyDB.removeItem(touchIdName, username || Peerio.user.username);
            },

            hasUserSeenOffer: function () {
                return Peerio.TinyDB.getItem(offerName, Peerio.user.username);
            },

            setUserSeenOffer: function () {
                return Peerio.TinyDB.saveItem(offerName, true, Peerio.user.username);
            },

            hasUserSeenBubble: function () {
                return Peerio.TinyDB.getItem(bubbleName, Peerio.user.username);
            },

            setUserSeenBubble: function () {
                return Peerio.TinyDB.saveItem(bubbleName, true, Peerio.user.username);
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
                return window.PeerioTouchIdKeychain.getValue(keychainName(username));
            },

            enableTouchId: function () {
                return Peerio.UI.TouchId.clearKeyPair()
                    .catch((error) => L.info(error))
                    .then(() => Peerio.UI.TouchId.showExclamationBubble())
                    .then(() => Peerio.UI.TouchId.saveKeyPair());
            },

            saveKeyPair: function () {
                var systemPin = uuid.v4();
                return window.PeerioTouchIdKeychain.saveValue(keychainName(), systemPin)
                    .then(() => Peerio.user.setPIN(systemPin, true))
                    .catch((error) => {
                        Peerio.UI.TouchId.setHasTouchID(Peerio.user.username, false);
                        return Promise.reject(error);
                    })
                    .then(() => Peerio.UI.TouchId.setHasTouchID(Peerio.user.username, true));
            },

            clearKeyPair: function () {
                return window.PeerioTouchIdKeychain.deleteValue(keychainName())
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
