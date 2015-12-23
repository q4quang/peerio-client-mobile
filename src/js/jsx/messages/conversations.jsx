(function () {
    'use strict';

    Peerio.UI.Conversations = React.createClass({
        componentDidMount: function () {
            this.subscriptions = [
                Peerio.Dispatcher.onConversationsUpdated(this.handleConversationsUpdated)
            ];
        },

        componentWillUnmount: function () {
            Peerio.Dispatcher.unsubscribe(this.subscriptions);
        },

        getInitialState: function () {
            if (!Date.currentYear) Date.currentYear = new Date().getFullYear();
            return {
                lastSeqID: Number.MAX_SAFE_INTEGER,
                tryLoading: true,
                hasOnceLoadedItems: false,
                conversations: null
            };
        },

        handleConversationsUpdated: function (data) {
            if (data.updateAllConversations) {
                this.refs.Messages.refresh();
                return;
            }
            if (data.deleted) {
                if (data.deleted.length)
                    this.refs.Messages.deleteItems(data.deleted);
                else
                    this.refs.Messages.refreshPage();
            }

        },

        getPage: function (lastItem, pageSize) {
            var lastSeqID = lastItem ? lastItem.seqID : Number.MAX_SAFE_INTEGER;

            return Peerio.Conversation.getNextPage(lastSeqID, pageSize)
                .then(arr => {
                    this.setState({
                        tryLoading: this.state.hasOnceLoadedItems || arr.length > 0,
                        hasOnceLoadedItems: this.state.hasOnceLoadedItems || arr.length > 0
                    });
                    return arr;
                });
        },

        getPrevPage: function (lastItem, pageSize) {
            var lastSeqID = lastItem ? lastItem.seqID : 0;
            return Peerio.Conversation.getPrevPage(lastSeqID, pageSize);
        },

        getItemsRange: function(from, to){
            return Peerio.Conversation.getRange(from, to);
        },

        render: function () {
            return this.state.tryLoading ? (
                <Peerio.UI.VScroll
                    className='content list-view'
                    id='Messages'
                    ref='Messages'
                    onGetPage={this.getPage}
                    onGetPrevPage={this.getPrevPage}
                    onGetItemsRange={this.getItemsRange}
                    itemKeyName='id'
                    itemComponent={Peerio.UI.ConversationsItem}/>)
                : <Peerio.UI.ConversationsPlaceholder/>;
        }
    });
}());
