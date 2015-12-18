(function () {
    'use strict';

    Peerio.UI.ConversationsVScroll = React.createClass({
        componentDidMount: function () {
            this.subscriptions =
                [
                    Peerio.Dispatcher.onMessageAdded(this.forceUpdate.bind(this, null)),
                    Peerio.Dispatcher.onConversationsUpdated(this.forceUpdate.bind(this, null))
                ];
            //used to format timestamp
        },
        componentWillUnmount: function () {
            Peerio.Dispatcher.unsubscribe(this.subscriptions);
        },
 
        propTypes: {
            onOpenConversation: React.PropTypes.func.isRequired,
            onDestroyConversation: React.PropTypes.func.isRequired,
            onSwipe: React.PropTypes.func.isRequired,
            onSwipeComplete: React.PropTypes.func.isRequired
        },

        getDefaultProps: function() {
            return {
                onOpenConversation: function() {},
                onDestroyConversation: function() {},
                onSwipe: function() {},
                onSwipeComplete: function() {}
            };
        },

        getInitialState: function () {
            return {
                currentYear: new Date().getFullYear(),
                lastTimestamp: Number.MAX_SAFE_INTEGER,
                tryLoading: true,
                hasOnceLoadedItems: false,
                conversations: null
            };
        },

        getItemId: function (item) {
            return item.id;
        },

        getPage: function (lastItem, pageSize) {
            var lastTimestamp = lastItem ? 
                lastItem.lastTimestamp : Number.MAX_SAFE_INTEGER; 

            return Peerio.Conversation.getNextPage(lastTimestamp)
            .then(arr => {
                this.setState({ 
                    tryLoading: this.state.hasOnceLoadedItems || (arr.length > 0),
                    hasOnceLoadedItems: this.state.hasOnceLoadedItems || arr.length > 0});
                return arr;
            });
        },

        renderItem: function(conv) {
            // building name to display for conversation item.
            // it should be in format "John Smith +3"
            // and it should not display current user's name,
            // unless he is the only one left in conversation
            if (!conv.username) {
                var displayName = '';
                for (var i = 0; i < conv.participants.length; i++) {
                    var username = conv.participants[i];
                    if (username === Peerio.user.username && conv.participants.length > 1) continue;
                    var contact = Peerio.user.contacts.dict[username];
                    displayName = (contact && contact.fullName) || '';
                    break;
                }
                if (conv.participants.length === 0)
                    //displayName = displayName || Peerio.user.fullName;
                    if (conv.participants.length > 2) {
                        displayName += ' [+' + (conv.participants.length - 2) + ']';
                    }
                    conv.displayName = displayName;
                    conv.username = username;
            }

            return (
                <Peerio.UI.ConversationsItem 
                onTap={this.props.onOpenConversation.bind(this, conv.id)} 
                key={conv.id}
                unread={conv.unreadCount} 
                fullName={conv.displayName}
                username={conv.username}
                hasFiles={conv.hasFiles} 
                timeStamp={moment(+conv.lastTimestamp)}
                messageCount={0} subject={conv.subject}
                onSwipe={this.props.onSwipe} 
                onSwipeComplete={this.props.onSwipeComplete}
                currentYear={this.state.currentYear}
                destroyConversation={this.props.onDestroyConversation.bind(this, conv.id)}/>
            );
        },

        render: function () {
            return this.state.tryLoading ? (
                <Peerio.UI.VScroll 
                onGetPage={this.getPage} 
                onGetItemId={this.getItemId} 
                onRenderItem={this.renderItem}/>
            ) : <Peerio.UI.ConversationsPlaceholder/>;
        },
    });
}());
