(function () {
  'use strict';

  Peerio.UI.Messages = React.createClass({
    mixins: [ReactRouter.Navigation],
    getInitialState: function () {
      return {};
    },
    componentWillMount: function () {
      this.setState({conversations: Peerio.Messages.cache});
    },
    componentDidMount: function () {
      var updateFn = function (conversations) {
        if (!this.isMounted()) return;
        this.setState({conversations: conversations});
      }.bind(this);
      // todo refactor when server paging is ready
      Peerio.Messages.getAllConversations(updateFn).then(updateFn);
    },
    openConversation: function (id) {
      this.transitionTo('conversation', {id: id});
    },
    render: function () {
      var nodes = this.state.conversations
        ? this.renderNodes()
        : Peerio.UI.ItemPlaceholder.getPlaceholdersArray();

      return (
        <div className="content" id="Messages" ref="messageList">
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
        if (!conv.displayName) {
          var displayName = null;
          for (var i = 0; i < conv.participants.length; i++) {
            var username = conv.participants[i];
            if (username === Peerio.user.username) continue;
            var contact = Peerio.user.contacts[username];
            displayName = (contact && contact.fullName) || username;
            break;
          }
          displayName = displayName || Peerio.user.fullName;
          if (conv.participants.length > 2) {
            displayName += ' [+' + (conv.participants.length - 2) + ']';
          }
          conv.displayName = displayName;
        }

        return (
          <Peerio.UI.Tappable onTap={this.openConversation.bind(this, conv.id)} key={conv.id}>
            <Peerio.UI.MessagesItem unread={conv.original.isModified} fullName={conv.displayName}
                                    fileCount={conv.fileCount} timeStamp={moment(+conv.lastTimestamp)}
                                    messageCount={conv.messageCount} subject={conv.original.subject}/>
          </Peerio.UI.Tappable>
        );
      }.bind(this));

    }
  });

  /**
   * Message list item component
   */
  Peerio.UI.MessagesItem = React.createClass({
    render: function () {
      return (
        <div className={'list-item' + (this.props.unread ? ' unread' : '')}>
          {this.props.fileCount ?
              (<div className="icon-with-label">
              <i className={'fa fa-paperclip attachment'}></i>
              <span className="icon-label">{this.props.fileCount > 0 ? this.props.fileCount : null}</span>
             </div>)
              : ''}
          <div className="name-and-subject">
            <div className="name">{this.props.fullName}</div>
            <div className="subject"><span className="message-count"><i
              className='fa fa-comment-o message-count-icon'></i>{this.props.messageCount}</span>{this.props.subject}</div>
          </div>
          <div className="timestamp">
            <div className="date">
              {this.props.timeStamp.format('MMM Do, YYYY')}
              <i className="fa fa-chevron-right"/>
            </div>
            <div className="time">
              {this.props.timeStamp.format('HH:mm:ss')}
            </div>
          </div>
        </div>);
    }
  });

}());
