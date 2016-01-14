(function () {
    'use strict';
    Peerio.UI.TouchId = React.createClass({
        statics: {
            pubkeyname: function() {
                return Peerio.user.username + '_public';
            },

            secretkeyname: function() {
                return Peerio.user.username + '_private';
            },

            touchidname: function(username) {
                return Peerio.user.username + '_touchid';
            },

            hasTouchID: function(username) {
                return Peerio.TinyDB.getObject(Peerio.UI.TouchId.touchidname(username));
            },

            setHasTouchID: function(username, value) {
                value ? 
                    Peerio.TinyDB.setObject(Peerio.UI.TouchId.touchidname(username), true) :
                    Peerio.TinyDB.removeItem(Peerio.UI.TouchId.touchidname(username));
            },

            saveKeyPair: function() {
                return window.PeerioTouchIdKeychain.saveValue(
                    Peerio.UI.TouchId.pubkeyname(), Peerio.user.keyPair.publicKey) 
                    //                    .then( () => window.PeerioTouchIdKeychain.saveValue(
                    //  Peerio.UI.TouchId.secretkeyname(), Peerio.user.keyPair.secretKey) )
                    .then( () => Peerio.UI.TouchId.setHasTouchID(Peerio.user.username, true) );
            },

            clearKeyPair: function() {
                return window.PeerioTouchIdKeychain.deleteValue(
                    Peerio.UI.TouchId.pubkeyname())
                    //.then( () => {
                    //   window.PeerioTouchIdKeychain.deleteValue(Peerio.UI.TouchId.secretkeyname());
                    //})
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
                Peerio.UI.TouchId.saveKeyPair()
            .then( () => {
                this.setState({enabled: true});
            }) : Peerio.UI.TouchId.clearKeyPair()
            .then( () => {
                this.setState({enabled: false});
            });
        },

        render: function() {


            return this.state.visible ? (
                <div onClick={this.enableTouchId}>
                    <span className="col-10">Enable fingerprint identification</span>
                    <span type="checkbox" className={this.state.enabled 
                        ? 'checkbox-input checked': 'checkbox-input'}></span>
                </div>
            ) : ( /* todo: beautify markup */
            <div className="col-12" style={{'margin-bottom': '1em'}}>
            Fingerprint identification unavailable</div>
            );
        }
    });
}());
