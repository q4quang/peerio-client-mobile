(function () {
    'use strict';

    Peerio.UI.SignupWizardOptIn = React.createClass({
        mixins: [ReactRouter.Navigation],

        getInitialState: function () {
            return {
            };
        },

        handleDataOptIn: function (enable) {
            (enable ? Peerio.DataCollection.enable() : Peerio.DataCollection.disable())
            .then( () => {
                Peerio.DataCollection.Signup.startSignup();
                this.props.handleNextStep();
            });
        },

        render: function () {
            return (
                <div className="animate-enter">
                    <div className="headline">Would you like to help with usability research?</div>
                    <p>By enabling anonymous data collection, we will collect 
                        non-identifying and non-content information to share with researchers and improve Peerio.</p>
                    <p>We understand your data has value. When you opt in, 
                        we will add 25MB to your account everyday as thanks for your contribution.</p>
                    <div className="buttons">
                        <Peerio.UI.Tappable 
                            element="div" 
                            className="btn-primary" 
                            onTap={this.handleDataOptIn.bind(this, false)}>Not right now</Peerio.UI.Tappable>
                        <Peerio.UI.Tappable 
                            element="div" 
                            className="btn-safe" 
                            onTap={this.handleDataOptIn.bind(this, true)}>Ok</Peerio.UI.Tappable>
                    </div>
                </div>);
        },
    });

}());
