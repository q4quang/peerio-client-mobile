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
                    <div className="headline">Set a passcode</div>
                  <p>This allows you to login <strong>from this device</strong> without entering your passphrase.</p>
                    <Peerio.UI.SetPin hideHeader={true} {...this.props} autoFocus={true} focusDelay={1000}/>
                </div>
            );
        },
    });

}());
