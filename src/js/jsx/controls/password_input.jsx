(function () {
    'use strict';

    Peerio.UI.PasswordInput = React.createClass({
        mixins: [Peerio.UI.AutoFocusMixin],

        render: function () {
           return (
               <input 
                   {...this.props}
                   maxLength="256" 
                   autoComplete="off" 
                   autoCorrect="off"
                   autoCapitalize="off"
                   spellCheck="false"/>
           );
        },
    });

}());
