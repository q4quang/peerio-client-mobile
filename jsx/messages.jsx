(function () {
  'use strict';

  Peerio.UI.Messages = React.createClass({
    mixins: [Peerio.UI.Mixins.GlobalTap],
    getInitialState: function () {
      return {};
    },
    globalTapHandler: function (e) {
      var item = Peerio.Helpers.getParentWithClass(e.target, 'list-item');
      if (!item || item.attributes['data-msgid'] == null) return;
      this.openConversation(item.attributes['data-msgid'].value);
    },
    componentWillMount: function () {
      Peerio.Messages.getAllConversationsGradually(function(conversations){
        if (!this.isMounted()) return;
        this.setState({conversations: conversations});
      }.bind(this));
    },
    render: function () {
      var messageNodes = this.state.conversations  ? this.renderNodes() : Peerio.UI.ItemPlaceholder.getPlaceholdersArray();

      return (
        <div className="content" id="Messages" ref="messageList"
             onTouchStart={this.registerTouchStart} onTouchEnd={this.registerTouchEnd}>
          {messageNodes}
        </div>
      );
    },
    renderNodes: function () {
      var nodes = this.state.conversations.data.map(function (convItem) {
        if (!convItem.original) {
          console.log("Conversation misses original message:", convItem);
          return;
        }
        var ts = moment(+convItem.lastTimestamp);

        // building name to display for conversation item.
        // it should be in format "John Smith +3"
        // and it should not display current user's name,
        // unless he is the only one left in conversation
        var fullName = null;
        for (var i = 0; i < convItem.participants.length; i++) {
          var username = convItem.participants[i];
          if (username === Peerio.user.username) continue;
          var contact = Peerio.user.contacts[username];
          fullName = (contact && contact.fullName) || username;
          break;
        }
        fullName = fullName || Peerio.user.fullName;
        if (convItem.participants.length > 2) {
          fullName += ' [+' + (convItem.participants.length - 2) + ']';
        }

        return (
          <Peerio.UI.MessagesItem key={convItem.id} msgId={convItem.id} unread={convItem.original.isModified}
                                  fullName={fullName} fileCount={convItem.fileCount}
                                  messageCount={convItem.messageCount}
                                  subject={convItem.original.subject} ts={ts}/>
        );
      });

      // todo: DRY sort function
      // todo: why did i put reverse() here instead of modifying the function?
      return nodes.sort(function (a, b) { return a.props.ts < b.props.ts ? -1 : (a.props.ts > b.props.ts ? 1 : 0); }).reverse();
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
