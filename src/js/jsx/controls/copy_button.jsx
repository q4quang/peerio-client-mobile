(function () {
    'use strict';

    Peerio.UI.CopyButton = React.createClass({
        copyToClipboard: function() {
            Peerio.NativeAPI.copyToClipboard(this.props.copy);
        },

        render: function() {
            return Peerio.NativeAPI.isClipboardAvailable() ? (
                <Peerio.UI.Tappable className="material-icons margin-small" element="i" onTap={this.copyToClipboard}>content_copy</Peerio.UI.Tappable>
            ) : null;
        }
    });
})();
