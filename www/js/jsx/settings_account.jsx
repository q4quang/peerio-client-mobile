(function () {

    'use strict';

    Peerio.UI.AccountSettings = React.createClass({
        getInitialState: function(){
            return {
                user: (Peerio.user.isMe) ? Peerio.user : false,
                newAddressText: "",
                firstName: Peerio.user ? Peerio.user.settings.firstName : '',
                lastName: Peerio.user ? Peerio.user.settings.lastName : ''
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

        addAddress: function(){

        },
        onAddressChange: function(event){
            this.setState({newAddressText:event.target.value})
        },

        confirmAddress: function(address, code) {
            this.state.user.confirmAddress(address, code).then(
                function() {
                    Peerio.Action.showAlert({text: "Address authorized"})
                });
        },

        addNewAddress: function(){
            //TODO: valid email or phone number.
            var newAddress = this.state.newAddressText;
            var emailRegex = new RegExp(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i);
            var phoneRegex = new RegExp(/^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/i);
            var self = this;
            if (emailRegex.test(newAddress)){
                //mocking new address addition
                var user = this.state.user;
                user.validateAddress(newAddress)
                    .then(function(response) {
                        user.addAddress(newAddress).then( function() {
                            self.setState({user:user, newAddressText:""})
                            Peerio.Action.showPrompt({
                                headline: "Enter the code",
                                text: "enter the code you received via email or SMS to confirm your address.",
                                inputType: "password",
                                onAccept: function(code) {
                                    self.confirmAddress(newAddress, code);
                                }
                            });
                        });
                    });



            } else {
                Peerio.Action.showAlert({text:"Sorry, that doesn't look like a valid email or phone number."})
            }

        },
        render: function(){
            var user = this.state.user;
            var addresses = user.getAddresses();

            addresses = addresses.map(function(address, index){
                return (<div>
                        {address.isConfirmed ? (
                            <div>
                                <div className="col-8">
                                    <span className="text-mono">{address.value}</span>
                                </div>
                                <div className="col-2 text-center">
                                    <input type="radio"
                                           name="default_address"
                                           id={"address_default_"+index}
                                           className="sr-only radio-button"
                                           checked={address.isPrimary}/>
                                    <label htmlFor={"address_default_"+index}
                                           className="radio-label"></label>
                                </div>
                                <div className="col-2 text-center">
                                    <i className="fa fa-trash-o"/>
                                </div>
                            </div>
                        ) :
                            <div>
                                <div className="col-8">
                                    <span className="text-mono">{address.value}</span>
                                </div>
                                <div className="col-4 text-center">
                                    <input type="text" className="text-input" placeholder="confirm"/>
                                </div>
                            </div>
                        }
                    </div>
                );
            });

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
                        {addresses}
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
                        <Peerio.UI.Tappable className="btn-link btn-danger">delete your account</Peerio.UI.Tappable>
                    </div>
                </div>
            );
        }
    });

}());