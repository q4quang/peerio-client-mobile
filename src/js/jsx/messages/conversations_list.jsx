(function () {
    'use strict';

    Peerio.UI.ConversationsList = React.createClass({
        componentDidMount: function () {
            this.subscriptions = [
                Peerio.Dispatcher.onConversationsUpdated(this.handleConversationsUpdated.bind(this, null))
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

        updateMessages: function(data) {
            if (!data || data.updated) {
                this.refs.Messages.refresh();
                return;
            }
            if (data.deleted) {
                if (data.deleted.length) {
                    (this.refs.Messages.deleteItems(data.deleted) == 0)
                    && this.setState( { 
                        tryLoading: false,
                        hasOnceLoadedItems: true
                    });
                }
                else
                    this.refs.Messages.refresh();
            }
        },

        handleConversationsUpdated: function (data) {
            if(!this.refs.Messages) {
                this.setState( { tryLoading: true } );
            } else {
                this.updateMessages(data);
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

        getItemsRange: function (from, to) {
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
                    itemComponent={Peerio.UI.ConversationsListItem}/>)
                : <Peerio.UI.ConversationsPlaceholder/>;
        }
    });
}());
