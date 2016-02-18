(function () {
    'use strict';

    /**
     * Mixin providing auto focus with delay (for animation)
     */
    Peerio.UI.AutoFocusMixin = {
        componentDidMount: function() {
            if(this.props.autoFocus) {
                var node = this.props.focusNode ?
                    this.refs[this.props.focusNode] : this.refs.textEdit;
                node && window.setTimeout( () => node.getDOMNode().focus(), 
                              this.props.focusDelay ? this.props.focusDelay : 100);
            }
        },
    };

}());



