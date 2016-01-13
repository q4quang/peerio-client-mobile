(function () {
    'use strict';

    Peerio.UI.SetupWizardStart = React.createClass({
        mixins: [ReactRouter.Navigation],
       
        render: function () {
           return (
                <div>
                    <h1 className="headline-lrg text-center">Welcome to Peerio!</h1>
                    <p> </p>
                    <p className="info-small text-center">Let's get started.</p>
                </div>
            );
        },
    });

}());



