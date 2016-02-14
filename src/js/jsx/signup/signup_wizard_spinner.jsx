(function () {
    'use strict';

    Peerio.UI.SignupWizardSpinner = React.createClass({
        render: function () {
            return ( 
                    <fieldset><i className="fa fa-circle-o-notch fa-spin"
                            style={{ marginLeft: '45%',fontSize: '400%',marginTop: '50%'}}></i></fieldset>
                   );
        },
    });
}());
