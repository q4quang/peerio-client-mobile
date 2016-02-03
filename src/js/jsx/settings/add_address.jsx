(function () {
    'use strict';

    Peerio.UI.AddAddress = React.createClass({

        mixins: [Peerio.UI.AutoFocusMixin],

        getInitialState: function () {
            return {
            };
        },

        addNewAddress: function (skip2FA) {
            var newAddress = this.refs.textEdit.getDOMNode().value;

            if ( !Peerio.Helpers.isValidEmail(newAddress)
                && !Peerio.Helpers.isValidPhone(newAddress) )
            return Peerio.UI.Alert.show({text: 'Sorry, that doesn\'t look like a valid email or phone number.'});

            if(Peerio.Helpers.isValidPhone(newAddress)) {
                newAddress = Peerio.Helpers.reformatPhone(newAddress);
            }
            // TODO: add 2FA here
            /* if (!skip2FA && Peerio.user.settings.twoFactorAuth) {
                return this.transitionTo('/app/settings/account/2fa');
            } */
            Peerio.user.validateAddress(newAddress)
            .then((response) => {
                L.info(response);
                // if server said address is ok to add
                if(response) {
                    Peerio.user.addAddress(newAddress)
                    .then( () => {
                        var addAndEnter = () => {
                            return Peerio.UI.Prompt.show({text: 'Please enter the code you received'})
                            .then((code) => Peerio.user.confirmAddress(newAddress, code))
                            .then(() => Peerio.UI.Alert.show({text: 'Address authorized'}))
                            .then(() => { return this.props.onSuccess && this.props.onSuccess(newAddress); })
                            .catch((error) => {
                                L.error(error);
                                if (error && error.code) {
                                    if (error.code === 406) {
                                        return Peerio.UI.Confirm.show({text: 'Confirmation code does not match. Would you like to try again?'})
                                        .then( () => addAndEnter() );
                                    }
                                    else {
                                        Peerio.Action.showAlert({text: 'Error adding address. Please contact support.'});
                                    }
                                }
                                return Promise.reject(error);
                            });
                        };
                        return addAndEnter()
                        .catch( (error) =>  {
                            Peerio.user.removeAddress(newAddress);
                        });
                    });
               } else {
                    Peerio.UI.Alert.show({text: 'Sorry, that address is already taken'});
                }
            });
        },

        render: function () {
           return (
               <div>
                   <div className="flex-row flex-align-center">
                       <input type="text" placeholder="add phone or email"
                           ref="textEdit"/>

                       <Peerio.UI.Tappable className="btn-primary" onTap={ this.addNewAddress }>
                           add
                       </Peerio.UI.Tappable>
                   </div>
               </div>
            );
        },
    });

}());
