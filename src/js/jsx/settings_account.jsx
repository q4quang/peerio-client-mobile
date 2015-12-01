(function () {

    'use strict';
    Peerio.UI.AccountSettingsItem = React.createClass({
        getInitialState: function() {
            return {
                isPrimary: this.props.data.isPrimary
            };
        },

        setPrimaryAddress: function(address) {
            this.setState({isPrimary: true});
            this.props.setPrimaryAddress(address);
        },

        render: function() {
            var address = this.props.data;
            var index = this.props.id;
            var removeAddress = this.props.removeAddress;

            return <div>
                     <div>
                        <div className="col-8">
                            <span className="text-mono">{address.value}</span>
                        </div>
                        <div className="col-2 text-center" onClick={this.setPrimaryAddress.bind(this, address.value)}>
                            <input type="radio"
                                   name="address_default"
                                   className="sr-only radio-button"
                                   checked={this.state.isPrimary}/>
                            <label htmlFor={'address_default_'+index}
                                   className="radio-label"></label>
                        </div>
                        <div className="col-2 text-center">
                            <i className="fa fa-trash-o" onClick={removeAddress.bind(this, address.value)}/>
                        </div>
                    </div>

                    </div>;
        }
    });

    Peerio.UI.AccountSettings = React.createClass({
        getInitialState: function(){
            return {
                user: (Peerio.user.isMe) ? Peerio.user : false,
                newAddressText: '',
                firstName: Peerio.user ? Peerio.user.settings.firstName : '',
                lastName: Peerio.user ? Peerio.user.settings.lastName : '',
                addresses: Peerio.user ? Peerio.user.getAddresses() : ''
            };
        },
        updateName: function(){
            this.doUpdateName = this.doUpdateName || _.throttle(function(){
                    return this.state.user.setName(this.state.firstName, this.state.lastName);
                }, 1000);
            this.doUpdateName();
        },

        updateFirstName: function() {
            this.setState({firstName: event.target.value});
            this.updateName();
        },

        updateLastName: function() {
            this.setState({lastName: event.target.value});
            this.updateName();
        },

        onAddressChange: function(event){
            this.setState({newAddressText:event.target.value});
        },

        confirmAddress: function(address, code) {
            var self = this;
            this.state.user.confirmAddress(address, code).then(
                function() {
                    self.setState({addresses: Peerio.user.getAddresses() });
                    Peerio.Action.showAlert({text: 'Address authorized'});
                });
        },

        removeAddress: function(address) {
            var self = this;
            this.state.user.removeAddress(address).then(function() {
                self.setState({addresses: Peerio.user.getAddresses() });
                Peerio.Action.showAlert({text: 'Address removed'});
            });
        },

        setPrimaryAddress: function(address) {
            this.state.user.setPrimaryAddress(address);
        },

        addNewAddress: function() {
            //TODO: valid email or phone number.
            var newAddress = this.state.newAddressText;
            var emailRegex = new RegExp(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i);
            var phoneRegex = new RegExp(/^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/i);
            var self = this;
            if (emailRegex.test(newAddress)){
                var user = this.state.user;
                user.validateAddress(newAddress)
                    .then(function(response) {
                        user.addAddress(newAddress).then( function() {
                            self.setState({addresses: Peerio.user.getAddresses() });
                            self.setState({user:user, newAddressText:''});
                            Peerio.Action.showPrompt({
                                headline: 'Enter the code',
                                text: 'enter the code you received via email or SMS to confirm your address.',
                                inputType: 'password',
                                onAccept: function(code) {
                                    self.confirmAddress(newAddress, code);
                                }
                            });
                        });
                    });



            } else {
                Peerio.Action.showAlert({text:'Sorry, that doesn\'t look like a valid email or phone number.'});
            }

        },

        deleteAccount: function() {
            var user = this.state.user;
            Peerio.Action.showConfirm({
                headline: 'Delete account',
                text: 'Are you sure you want to delete account?',
                onAccept: function() {
                    user.closeAccount().then( function() {
                        Peerio.Action.showAlert({text: 'Account deleted. Signing out.',
                            onClose: function(code) {
                                Peerio.NativeAPI.signOut();
                            }});
                    });
                }
            });
        },

        render: function(){
            var user = this.state.user;
            var addresses = this.state.addresses;
            var self = this;

            return (
                <div className="content-padded flex-col">
                    <div className="flex-col-1">

                        <div className="text-input-group col-12">
                            <input className="text-input"
                                   id="first-name"
                                   type="text"
                                   required="required"
                                   value={this.state.firstName}
                                   onChange={this.updateFirstName}
                                   onBlur={this.updateFirstName}
                                />
                            <label className="text-input-label" htmlFor="first-name">First Name</label>
                        </div>
                        <div className="text-input-group col-12">
                            <input className="text-input"
                                   id="last-name"
                                   type="text"
                                   required="required"
                                   value={this.state.lastName}
                                   onChange={this.updateLastName}
                                   onBlur={this.updateLastName}
                                />
                            <label className="text-input-label" htmlFor="first-name">Last Name</label>
                        </div>

                        <div className="info-label col-8">Addresses</div>
                        <div className="subhead-inline col-2">primary</div>
                        <div className="subhead-inline col-2">remove</div>
                        {
                            addresses.map(function(address, index){
                                return <Peerio.UI.AccountSettingsItem key={index} id={index} data={address}
                                                                      removeAddress={self.removeAddress}
                                                                      setPrimaryAddress={self.setPrimaryAddress}/>;
                        })}
                        <div>
                            <div className="col-8">
                                <input type="text" className="text-input" placeholder="add phone or email" onChange={this.onAddressChange} value={this.state.newAddressText}/>
                            </div>
                            <div className="col-4 text-center">
                                <Peerio.UI.Tappable className="btn-sm" onTap={this.addNewAddress}>add address</Peerio.UI.Tappable>
                            </div>
                        </div>
                        <hr/>
                        <div className="info-label">Your public key: </div>
                        <span className="text-mono">{user.publicKey}</span>
                    </div>

                    <div className="flex-col-0">
                        <Peerio.UI.Tappable className="btn-link btn-danger" onTap={this.deleteAccount}>delete your account</Peerio.UI.Tappable>
                    </div>
                </div>
            );
        }
    });

}());