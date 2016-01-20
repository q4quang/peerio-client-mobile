(function () {
    'use strict';

    Peerio.UI.SetupWizardStart = React.createClass({
        mixins: [ReactRouter.Navigation],

        render: function () {
           return (
                <div>
                    <div className="headline">Welcome to Peerio!</div>
                    <p>
                      In order to optimize your experience, we recommend you complete this short, 3 step, setup wizard.
                    </p>
                    <p>
                      All steps are optional. You can safely exit the wizard at any point and skip steps that don't apply to you.
                    </p>
                </div>
            );
        },
    });

}());
