/**
 * Detects links and converts them to clickable spans
 */
(function () {
    'use strict';

    Peerio.UI.Linkify = React.createClass({
        shouldComponentUpdate: function (nextProps, nextState) {
            return nextProps.text !== this.props.text;
        },
        open: function (href) {
            Peerio.UI.Confirm.show({text:'Warning! Please only open links from the contacts you trust'})
            .then(() => this.props.onOpen(href))
            .catch(() => true);
        },
        render: function () {
            this.text = this.props.text;
            var nodes = linkify.tokenize(this.text).map( (token, i) => {
                if (token.isLink)
                    return <Peerio.UI.Tappable 
                        key={i}
                        element="span" 
                        className="message-link"
                        onTap={this.open.bind(this, token.toHref())}>{token.toString()}</Peerio.UI.Tappable>;
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
