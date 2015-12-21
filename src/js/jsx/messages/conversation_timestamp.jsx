(function () {
    'use strict';

    Peerio.UI.ConversationTimestamp = React.createClass({
        getInitialState: function () {
            return {relativeTime: true};
        },
        toggleRelative: function () {
            this.setState({relativeTime: !this.state.relativeTime});
        },
        render: function () {
            var timestamp = this.props.timestamp;
            var renderStartTs = moment();
            var momentTimestamp = moment(+timestamp);
            var relativeTime = momentTimestamp.calendar(renderStartTs, {sameElse: 'MMMM DD, YYYY'});
            var absoluteTime = momentTimestamp.format('MMMM DD YYYY, h:mm A');
            var messageDate = (momentTimestamp.isSame(renderStartTs, 'year')) ?
                momentTimestamp.format('MMM Do') : momentTimestamp.format('MMM Do YYYY');

            return <div className="headline-divider"
            onTouchEnd={this.toggleRelative}>{this.state.relativeTime ? relativeTime : absoluteTime }</div>;
        }
    });

}());
