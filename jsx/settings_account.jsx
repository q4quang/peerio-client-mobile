(function () {

    'use strict';

    Peerio.UI.AccountSettings = React.createClass({
        getInitialState: function(){
            return {
                user: (Peerio.user.isMe) ? Peerio.user : false,
                newAddressText: ""
            };
        },
        addAddress: function(){

        },
        onAddressChange: function(event){
            this.setState({newAddressText:event.target.value})
        },
        addNewAddress: function(){
            //TODO: valid email or phone number.
            var newAddress = this.state.newAddressText;
            var emailRegex = new RegExp(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i);
            var phoneRegex = new RegExp(/^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/i);

            if (emailRegex.test(newAddress) || phoneRegex.test(newAddress)){
                //mocking new address addition
                var user = this.state.user;
                user.settings.addresses.push({type: "email", value: newAddress, isPrimary: false, isConfirmed: false})
                this.setState({user:user, newAddressText:""})
                Peerio.Action.showAlert({text:"You'll receive an email/SMS with an authentication code. Please enter the code to confirm your new address."})
            } else {
                Peerio.Action.showAlert({text:"Sorry, that doesn't look like a valid email or phone number."})
            }

        },
        render: function(){
            var user = this.state.user;
            var addresses = user.settings.addresses.map(function(address, index){
                return (<div>
                        {address.isConfirmed ? (
                            <div>
                                <div className="col-8">
                                    <input className="text-input" type="text" value={address.value}/>
                                </div>
                                <div className="col-2 text-center">
                                    <input type="radio" name="default_address" id={"address_default_"+index} className="sr-only radio-button" checked={address.isPrimary}/>
                                    <label htmlFor={"address_default_"+index} className="radio-label"></label>
                                </div>
                                <div className="col-2 text-center">
                                    <i className="fa fa-trash-o"/>
                                </div>
                            </div>
                        ) :
                            <div>
                                <div className="col-8">
                                    <input className="text-input" type="text" value={address.value} disabled="disabled"/>
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
                            <input className="text-input" id="first-name" type="text" required="required" value={user.firstName}/>
                            <label className="text-input-label" htmlFor="first-name">First Name</label>
                        </div>
                        <div className="text-input-group col-12">
                            <input className="text-input" type="text" required="required" value={user.lastName}/>
                            <label className="text-input-label" htmlFor="first-name">First Name</label>
                        </div>

                        <div className="info-label col-8">Addresses</div>
                        <div className="subhead-inline col-2">primary</div>
                        <div className="subhead-inline col-2">remove</div>
                        {addresses}
                        <div className="col-8">
                            <input type="text" className="text-input" placeholder="add phone or email" onChange={this.onAddressChange} value={this.state.newAddressText}/>
                            <button className="btn-sm" onTouchEnd={this.addNewAddress}>add address</button>
                        </div>
                        <hr/>
                        <div className="info-label">Your public key: </div>
                        <span className="text-mono">{user.publicKey}</span>
                    </div>

                    <div className="flex-col-0">
                        <button className="btn-link btn-danger">delete your account</button>
                    </div>
                </div>
            );
        }
    });

}());