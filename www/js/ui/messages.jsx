(function () {
  'use strict';

  Peerio.UI.Messages = React.createClass({
    mixins: [Peerio.UI.Mixins.GlobalTap],
    getInitialState: function () {
      return {
        openConversation: null
      };
    },

    componentDidMount: function () {
      Peerio.Dispatcher.onNavigateBack(this.back);
      this.boundForceUpdate = this.forceUpdate.bind(this, null); // react freaks out without null argument
      Peerio.Dispatcher.onConversationsLoaded(this.boundForceUpdate);
      Peerio.Dispatcher.onMessagesUpdated(this.boundForceUpdate);
      Peerio.Data.loadConversations();
    },
    componentWillUnmount: function () {
      Peerio.Dispatcher.unsubscribe(this.boundForceUpdate, this.back);
    },
    openConversation: function (id) {
      this.setState({openConversation: id});
      Peerio.Actions.navigatedIn('send', Peerio.Actions.sendCurrentMessage);
    },
    back: function () {
      // todo: probably subview should control it's own closing, utilizing event processing interruption and signalling back to parent
      if(this.state.openConversation===null) return;
      this.setState({openConversation: null});
      Peerio.Actions.navigatedOut();
    },
    globalTapHandler: function (e) {
      var item = Peerio.Helpers.getParentWithClass(e.target, 'list-item');
      if (!item || item.attributes['data-msgid'] == null) return;
      this.openConversation(item.attributes['data-msgid'].value);
    },
    render: function () {
      if (this.state.openConversation !== null)
        return ( <Peerio.UI.Conversation conversationId={this.state.openConversation}/> );

      var messageNodes = Object.keys(Peerio.user.conversations).map(function (id) {
        var item = Peerio.user.conversations[id];
        if (!item.original) return;
        var ts = moment(+item.lastTimestamp);
        var sender = Peerio.user.contacts[item.original.sender];

        return (
          <Peerio.UI.MessagesItem key={item.id} msgId={item.id} unread={item.original.isModified}
            fullName={sender ? sender.fullName : item.original.sender} fileCount={item.fileCount}
            subject={item.original.decrypted.subject} ts={ts} />
        );
      });

      // todo: DRY sort function
      // todo: why did i put reverse() here instead of modifying the function?
      messageNodes = messageNodes.sort(function (a, b) { return a.props.ts < b.props.ts ? -1 : (a.props.ts > b.props.ts ? 1 : 0); }).reverse();

      return (
        <div className="content" id="Messages" ref="messageList"
          onTouchStart={this.registerTouchStart} onTouchEnd={this.registerTouchEnd}>
          {messageNodes}
        </div>
      );
    }
  });

  /**
   * Message list item component
   */
  Peerio.UI.MessagesItem = React.createClass({
    render: function () {
      return (
        <div className={'list-item' + (this.props.unread ? ' unread' : '')} data-msgid={this.props.msgId}>
          <div className="name-and-subject">
            <span className="name">{this.props.fullName}</span>
            <br/>
            <span className="subject">{this.props.subject}</span>
          </div>
          <div className="timestamp">
            <span className="date">{this.props.ts.format('MMM Do, YYYY')}</span>
            <br/>{this.props.ts.format('HH:mm:ss')}
          </div>
          <span className={this.props.fileCount ? '' : 'hide'}>
            <i className={'fa fa-paperclip attachment'}></i>
            <span className="attachment-count">{this.props.fileCount > 0 ? this.props.fileCount : null}</span>
          </span>
        </div>);
    }
  });

}());
