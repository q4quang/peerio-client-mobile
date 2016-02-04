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
            var nodes = linkify.tokenize(this.text).map( (token, i) => {
                if (token.isLink)
                    return <Peerio.UI.Tappable 
                        key={i}
                        element="span" 
                        className="message-link"
                        onTap={this.props.onOpen.bind(null, token.toHref())}>{token.toString()}</Peerio.UI.Tappable>;
                else
                    return <span key={i}>{token.toString()}</span>;
            });
            return (
                <span>
                    {nodes}
                </span>
            );
        }
    });

}());
