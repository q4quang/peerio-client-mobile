(function () {
    'use strict';

    Peerio.UI.Conversations = React.createClass({
        componentDidMount: function () {
            this.subscriptions =
                [
                    Peerio.Dispatcher.onMessageAdded(this.forceUpdate.bind(this, null)),
                    Peerio.Dispatcher.onConversationsUpdated(this.forceUpdate.bind(this, null))
                ];
        },

        componentWillUnmount: function () {
            Peerio.Dispatcher.unsubscribe(this.subscriptions);
        },

        getInitialState: function () {
            if (!Date.currentYear) Date.currentYear = new Date().getFullYear();
            return {
                lastTimestamp: Number.MAX_SAFE_INTEGER,
                tryLoading: true,
                hasOnceLoadedItems: false,
                conversations: null
            };
        },

        getPage: function (lastItem, pageSize) {
            var lastTimestamp = lastItem ? lastItem.lastTimestamp : Number.MAX_SAFE_INTEGER;

            return Peerio.Conversation.getNextPage(lastTimestamp, pageSize)
                .then(arr => {
                    this.setState({
                        tryLoading: this.state.hasOnceLoadedItems || arr.length > 0,
                        hasOnceLoadedItems: this.state.hasOnceLoadedItems || arr.length > 0
                    });
                    return arr;
                });
        },


        render: function () {
            return this.state.tryLoading ? (
                <Peerio.UI.VScroll onGetPage={this.getPage} itemKeyName='id' itemComponent={Peerio.UI.ConversationsItem}/>)
                : <Peerio.UI.ConversationsPlaceholder/>;
        }
    });
}());
