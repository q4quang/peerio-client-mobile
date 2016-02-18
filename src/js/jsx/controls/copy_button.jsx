(function () {
    'use strict';

    Peerio.UI.CopyButton = React.createClass({
        copyToClipboard: function() {
            Peerio.NativeAPI.copyToClipboard(this.props.copy)
            .then( () => this.props.onCopy && this.props.onCopy() );
        },

        render: function() {
            return true || Peerio.NativeAPI.isClipboardAvailable() ? (
                <Peerio.UI.Tappable ref='button' className="material-icons margin-small" element="i" onTap={this.copyToClipboard}>content_copy</Peerio.UI.Tappable>
            ) : null;
        }
    });
})();
