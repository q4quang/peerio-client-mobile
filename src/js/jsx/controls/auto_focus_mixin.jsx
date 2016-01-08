(function () {
    'use strict';

    /**
     * Mixin providing auto focus with delay (for animation)
     */
    Peerio.UI.AutoFocusMixin = {
        componentDidMount: function() {
            this.props.autoFocus && this.refs.textEdit &&
                window.setTimeout( () => this.refs.textEdit.getDOMNode().focus(), 
                              this.props.focusDelay ? this.props.focusDelay : 100);
        },
    };

}());



