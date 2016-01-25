(function () {
    'use strict';
    Peerio.UI.TouchId = React.createClass({
        statics: {
            keyname: function(username) {
                return (username ? username : Peerio.user.username) + '_keypair';
            },

            touchidname: function(username) {
                return (username ? username : Peerio.user.username) + '_touchid';
            },

            bubblename: function() {
                return Peerio.user.username + '_bubble';
            },

            hasTouchID: function(username) {
                return Peerio.TinyDB.getObject(Peerio.UI.TouchId.touchidname(username));
            },

            setHasTouchID: function(username, value) {
                return value ?
                    Peerio.TinyDB.setObject(Peerio.UI.TouchId.touchidname(username), true) :
                    Peerio.TinyDB.removeItem(Peerio.UI.TouchId.touchidname(username));
            },

            getSystemPin: function(username) {
                return window.PeerioTouchIdKeychain.getValue(
                Peerio.UI.TouchId.keyname(username));
            },

            saveKeyPair: function() {
                var systemPin = uuid.v4();
                return window.PeerioTouchIdKeychain.saveValue(
                    Peerio.UI.TouchId.keyname(),
                    systemPin
                )
                .then( () => Peerio.user.setPIN(systemPin, true) )
                .catch( (error) => {
                    Peerio.UI.TouchId.setHasTouchID(Peerio.user.username, false);
                    return Promise.reject(error);
                })
                .then( () => Peerio.UI.TouchId.setHasTouchID(Peerio.user.username, true) );
            },

            clearKeyPair: function() {
                return window.PeerioTouchIdKeychain.deleteValue(
                    Peerio.UI.TouchId.keyname())
                    .then( () => Peerio.UI.TouchId.setHasTouchID(Peerio.user.username, false) );
            }
        },

        getInitialState: function() {
            return { visible: false, enabled: false };
        },

        componentWillMount: function() {
            if( window.PeerioTouchIdKeychain ) {
                window.PeerioTouchIdKeychain.isFeatureAvailable()
                .then( () => {
                    this.setState( { visible: true } );
                });

                Peerio.UI.TouchId.hasTouchID(Peerio.user.username)
                .then( (value) => this.setState({enabled: !!value}) );

                Peerio.NativeAPI.isForcefulFingerprintEnabled()
                .then( (value) => this.setState({fingerPrintWarning: value}) );
            }
        },

        hasUserSeenBubble: function() {
            return Peerio.TinyDB.getObject(Peerio.UI.TouchId.bubblename());
        },

        setUserSeenBubble: function() {
            return Peerio.TinyDB.setObject(Peerio.UI.TouchId.bubblename(), true);
        },

        showExclamationBubble: function() {
            return this.hasUserSeenBubble()
            .then( (hasSeen) => {
                return hasSeen ? Promise.resolve(true) : 
                    Peerio.UI.Confirm.show({
                    text: 'Enabling TouchID requires using your keychain, would you like to proceed?'
                });
            })
            .then( () => this.setUserSeenBubble() );
        },

        enableTouchId: function() {
            var enabled = !this.state.enabled;
            enabled ?
                Peerio.UI.TouchId.clearKeyPair()
            .catch( (error) => L.info(error) )
            .then( () => this.showExclamationBubble() )
            .then( () => Peerio.UI.TouchId.saveKeyPair())
            .then( () => {
                this.setState({enabled: true});
            }) : Peerio.UI.TouchId.clearKeyPair()
            .then( () => {
                this.setState({enabled: false});
            });
        },

        render: function() {

            return this.state.visible ? (
                <ul>
                  <Peerio.UI.Tappable element="li" onTap={this.enableTouchId}>
                    <div type="checkbox" className={'checkbox-input ' + (this.state.enabled
                    ? 'checked': null)}>
                        <i className="material-icons"></i>
                        </div>
                        <div>Enable fingerprint identification</div>
                    </Peerio.UI.Tappable>
                    { this.state.fingerPrintWarning ? (
                    <div>
                        <p><b>NOTE ON LAW ENFORCEMENT</b></p>
                        <p>In Oct. 2014, a USA court ruled that a police officer can demand you to unlock your device with a fingerprint but not an alphanumeric passcode. Similar laws may exist in other national or regional jurisdictions and should be considered if law enforcement is part of your threat model.</p>
                    </div>
                    ) : null }
                </ul>
            ) : (
                <ul>
                    <li>Fingerprint identification unavailable</li>
                </ul>
            );
        }
    });
}());
