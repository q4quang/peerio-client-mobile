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

            // TODO: add 2FA here
            /* if (!skip2FA && Peerio.user.settings.twoFactorAuth) {
                return this.transitionTo('/app/settings/account/2fa');
            } */
            Peerio.user.validateAddress(newAddress)
            .then((response) => {
                L.info(response);
                response ?
                    Peerio.user.addAddress(newAddress)
                .then(() => Peerio.UI.Prompt.show({text: 'Please enter the code you received'}))
                .then((code) => Peerio.user.confirmAddress(newAddress, code))
                .then(() => Peerio.UI.Alert.show({text: 'Address authorized'}))
                .then(() => { return this.props.onSuccess && this.props.onSuccess(newAddress); })
                .catch((error) => {
                    L.error(error);
                    (error && error.code === 406) ?
                        Peerio.Action.showAlert({text: 'Wrong confirmation code. Please try again.'}) :
                        Peerio.Action.showAlert({text: 'Error adding address. Please contact support.'});
                    Peerio.user.removeAddress(newAddress);
                })
                : Peerio.UI.Alert.show({text: 'Sorry, that address is already taken'});
            });
        },

        render: function () {
           return (
               <div>
                   <div className="col-8">
                       <input type="text" className="text-input" placeholder="add phone or email"
                           ref="textEdit"/>
                   </div>
                   <div className="col-4 text-center">
                       <Peerio.UI.Tappable className="btn-sm btn-block" onTap={ this.addNewAddress }>
                           add
                       </Peerio.UI.Tappable>
                   </div>
               </div>
            );
        },
    });

}());



