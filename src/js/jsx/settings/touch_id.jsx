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

            hasTouchID: function(username) {
                return Peerio.TinyDB.getObject(Peerio.UI.TouchId.touchidname(username));
            },

            setHasTouchID: function(username, value) {
                return value ?
                    Peerio.TinyDB.setObject(Peerio.UI.TouchId.touchidname(username), true) :
                    Peerio.TinyDB.removeItem(Peerio.UI.TouchId.touchidname(username));
            },

            getKeyPair: function(username) {
                return window.PeerioTouchIdKeychain.getValue(
                Peerio.UI.TouchId.keyname(username))
                .then( (keyPair) => {
                    var keyPair = JSON.parse(keyPair);
                    keyPair.publicKey = Peerio.Util.toInt8Array(keyPair.publicKey);
                    keyPair.secretKey = Peerio.Util.toInt8Array(keyPair.secretKey);
                    return keyPair;
                });

            },

            saveKeyPair: function() {
                return window.PeerioTouchIdKeychain.saveValue(
                    Peerio.UI.TouchId.keyname(),
                    JSON.stringify(Peerio.user.keyPair)
                )
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
            }
        },

        enableTouchId: function() {
            var enabled = !this.state.enabled;
            enabled ?
                Peerio.UI.TouchId.clearKeyPair()
            .catch( (error) => L.info(error) )
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
                </ul>
            ) : (
                <ul>
                    <li>Fingerprint identification unavailable</li>
                </ul>
            );
        }
    });
}());
