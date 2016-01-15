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
               <Peerio.UI.EnterCoupon {...this.props} autoFocus={true} focusDelay={1000}/>
            );
        },
    });

}());
