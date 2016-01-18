(function () {
    'use strict';

    Peerio.UI.PinInput = React.createClass({
        mixins: [Peerio.UI.AutoFocusMixin],

        getDefaultProps: function() {
            return {
                'data-password': 'yes'
            };
        },

        render: function () {
           return (
               <input 
                   {...this.props}
                   type="number"
                   inputMode="numeric"
                   pattern="[0-9]*"
                   maxLength="256" 
                   autoComplete="off" 
                   autoCorrect="off"
                   autoCapitalize="off"
                   spellCheck="false"/>
           );
        },
    });

}());
