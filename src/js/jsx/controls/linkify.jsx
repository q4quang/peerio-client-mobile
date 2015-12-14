/**
 * Detects links and converts them to clickable spans
 */
(function () {
    'use strict';

    Peerio.UI.Linkify = React.createClass({
        shouldComponentUpdate: function (nextProps, nextState) {
            return nextProps.text !== this.props.text;
        },
        render: function () {
            this.text = this.props.text;
            var nodes = linkify.tokenize(this.text).map(token => {
                if (token.isLink)
                    return <span className="message-link"
                                 onClick={this.props.onOpen.bind(null, token.toHref())}>{token.toString()}</span>;
                else
                    return <span>{token.toString()}</span>;
            });
            return (
                <span>
                    {nodes}
                </span>
            );
        }
    });

}());
