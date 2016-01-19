(function () {
    'use strict';

    Peerio.UI.SetupWizardEmail = React.createClass({
        mixins: [ReactRouter.Navigation],

        getInitialState: function () {
            return {
            };
        },

        render: function () {
           return (
                <div>
                  <p>Help your contacts find you on Peerio, receive notifications, and enable support services by adding your email address or phone number. </p>
                    <div className="input-group">
                        <label>Email Address / Phone Number</label>
                        <Peerio.UI.AddAddress {...this.props} autoFocus={true} focusDelay={1000}/>
                    </div>
               </div>
            );
        },
    });

}());
