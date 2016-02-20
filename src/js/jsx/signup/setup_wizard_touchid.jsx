(function () {
    'use strict';

    Peerio.UI.SetupWizardTouchID = React.createClass({
        mixins: [ReactRouter.Navigation],

        getInitialState: function () {
            return {
            };
        },

        componentWillMount: function () {
            Peerio.UI.TouchId.setUserSeenOffer();
            Peerio.NativeAPI.isForcefulFingerprintEnabled()
            .then((value) => this.setState({fingerPrintWarning: value}));
        },

        enableTouchID: function () {
            Peerio.UI.TouchId.setUserSeenBubble()
            .then( () => Peerio.UI.TouchId.enableTouchId() )
            .finally( () => this.props.onSuccess() );
        },

        render: function () {
            return (
                <div className="animate-enter">
                    <div className="headline">Would you like to enable Touch ID?</div>
                    <p>Touch ID requires using your Apple Keychain.</p>
                    { this.state.fingerPrintWarning ? (
                    <p>
                        Note on law enforcement. In Oct. 2014, a USA court ruled that a police officer can demand you to unlock your device with a fingerprint but not an alphanumeric passcode. Similar laws may exist in other national or regional jurisdictions and should be considered if law enforcement is part of your threat model.</p>) : null }
                    <div className="buttons">
                        <Peerio.UI.Tappable 
                            element="div" 
                            className="btn-safe" 
                            onTap={this.enableTouchID}>Enable</Peerio.UI.Tappable>
                    </div>
                </div>);
        },
    });

}());
