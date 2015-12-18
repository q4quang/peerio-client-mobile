(function () {
    'use strict';

    Peerio.UI.Conversations = React.createClass({
        mixins: [ReactRouter.Navigation],
        getInitialState: function () {
            return {
            };
        },
        componentWillMount: function () {
        },
        openConversation: function (id) {
            this.transitionTo('conversation', {id: id});
        },
        destroyConversation: function (id) {
            Peerio.Messages.removeConversation(id);
        },
        /*
        loadNextPage: function () {
            // can't use state for this, can't guarantee it will get set before next event call
            if (this.loading) return;
            this.loading = true;
            this.forceUpdate();
            Peerio.Conversation.getNextPage(this.state.lastTimestamp)
                .then(arr => {
                    var c = this.state.conversations;
                    if (c === null) c = this.state.conversations = Collection('id', null, 'lastTimestamp', false);
                    for (var i = 0; i < arr.length; i++) {
                        c.addOrReplace(arr[i], true);
                    }
                    c.sort();
                    this.loading = false;
                    this.setState({lastTimestamp: c.arr.length ? c.arr[c.arr.length-1].lastTimestamp : Number.MAX_SAFE_INTEGER});
                });
        },*/
        render: function () {
           return (
                <Peerio.UI.ConversationsVScroll
                onOpenConversation={this.openConversation}
                onDestroyConversation={this.destroyConversation}/>
            );
        },
    });
}());
