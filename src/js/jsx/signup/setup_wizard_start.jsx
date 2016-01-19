(function () {
    'use strict';

    Peerio.UI.SetupWizardStart = React.createClass({
        mixins: [ReactRouter.Navigation],

        render: function () {
           return (
                <div>
                    <div className="headline text-center">Welcome to Peerio!</div>
                    <p className="info-small text-center">Let's get started.</p>
                </div>
            );
        },
    });

}());
