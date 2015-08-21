(function () {
  'use strict';

  Peerio.UI.Messages = React.createClass({
    mixins: [Peerio.UI.Mixins.GlobalTap, ReactRouter.Navigation],
    getInitialState: function () {
      return {};
    },
    globalTapHandler: function (e) {
      var item = Peerio.Helpers.getParentWithClass(e.target, 'list-item');
      if (!item || item.attributes['data-msgid'] == null) return;
      this.transitionTo('conversation', {id:item.attributes['data-msgid'].value});
    },
    componentWillMount: function () {
      Peerio.Messages.getAllConversations(function (conversations) {
        if (!this.isMounted()) return;
        this.setState({conversations: conversations});
      }.bind(this));
    },
    render: function () {
      var nodes = this.state.conversations
        ? this.renderNodes()
        : Peerio.UI.ItemPlaceholder.getPlaceholdersArray();

      return (
        <div className="content" id="Messages" ref="messageList" onTouchTap={console.log.bind(console,'TAP')}
             onTouchStart={this.registerTouchStart} onTouchEnd={this.registerTouchEnd}>
          {nodes}
        </div>
      );
    },
    renderNodes: function () {
      return this.state.conversations.map(function (conv) {
        // building name to display for conversation item.
        // it should be in format "John Smith +3"
        // and it should not display current user's name,
        // unless he is the only one left in conversation
        var fullName = null;
        for (var i = 0; i < conv.participants.length; i++) {
          var username = conv.participants[i];
          if (username === Peerio.user.username) continue;
          var contact = Peerio.user.contacts[username];
          fullName = (contact && contact.fullName) || username;
          break;
        }
        fullName = fullName || Peerio.user.fullName;
        if (conv.participants.length > 2) {
          fullName += ' [+' + (conv.participants.length - 2) + ']';
        }

        return (
          <Peerio.UI.MessagesItem key={conv.id} msgId={conv.id} unread={conv.original.isModified}
                                  fullName={fullName} fileCount={conv.fileCount} timeStamp={moment(+conv.lastTimestamp)}
                                  messageCount={conv.messageCount} subject={conv.original.subject}/>
        );
      });

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
            <span className="subject"><span className="message-count"><i
              className='fa fa-comment-o message-count-icon'></i>{this.props.messageCount}</span>{this.props.subject}</span>
          </div>
          <div className="timestamp">
            <span className="date">{this.props.timeStamp.format('MMM Do, YYYY')}</span>
            <br/>{this.props.timeStamp.format('HH:mm:ss')}
          </div>
          <span className={this.props.fileCount ? '' : 'hide'}>
            <i className={'fa fa-paperclip attachment'}></i>
            <span className="attachment-count">{this.props.fileCount > 0 ? this.props.fileCount : null}</span>
          </span>
        </div>);
    }
  });

}());
