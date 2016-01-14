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

            saveKeyPair: function() {
                return window.PeerioTouchIdKeychain.saveValue(
                    Peerio.UI.TouchId.pubkeyname(), Peerio.user.keyPair.publicKey) 
                .then( () => window.PeerioTouchIdKeychain.saveValue(
                    Peerio.UI.TouchId.secretkeyname(), Peerio.user.keyPair.secretKey) );
            },

            clearKeyPair: function() {
                return window.PeerioTouchIdKeychain.deleteValue(
                    Peerio.UI.TouchId.pubkeyname())
                    .then( () => window.PeerioTouchIdKeychain
                          .deleteValue(Peerio.UI.TouchId.secretkeyname()) );
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

                // check if key exists already by trying to delete it
                Peerio.UI.TouchId.clearKeyPair()
                .catch( (error) => Promise.reject() )
                .then( () => Peerio.UI.TouchId.saveKeyPair() )
                .then( () => {
                    this.setState({enabled: true});
                })
                .catch( (error) => {
                    L.error(error);
                    Peerio.UI.TouchId.clearKeyPair();
                });
            }
        },

        enableTouchId: function() {
            this.state.enabled ? 
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
