(function () {
    'use strict';

    Peerio.UI.SetupWizardCoupon = React.createClass({
        mixins: [ReactRouter.Navigation],
       
        getInitialState: function () {
            return {
            };
        },

        render: function () {
           return (
                <div>
                    <p className="info-small">If you have a promotional code, please enter it below.</p>
                    <p className="info-small"></p>
                </div>
            );
        },
    });

}());



