(function () {
    'use strict';

    Peerio.UI.SetupWizardPin = React.createClass({
        mixins: [ReactRouter.Navigation],
       
        getInitialState: function () {
            return {
            };
        },

        render: function () {
           return (
                <div>
                    <p className="info-small">Setting a passcode allows you to login from this device without entering your passphrase.</p>
                    <p className="info-small">Set a passcode?</p>
                    <Peerio.UI.SetPin hideHeader={true} {...this.props} focusDelay={1000}/>
                </div>
            );
        },
    });

}());



