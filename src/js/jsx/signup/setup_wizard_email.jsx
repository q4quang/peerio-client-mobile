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
                    <p className="info-small">Adding your email address or phone number helps your contacts find you on Peerio, allows you to receive notifications, and enables support services.</p>
                    <p className="info-small">Update your contact info?</p>
                    <Peerio.UI.AddAddress {...this.props} autoFocus={true} focusDelay={1000}/>
               </div>
            );
        },
    });

}());



