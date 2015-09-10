(function () {
  'use strict';

  Peerio.UI.Messages = React.createClass({
    mixins: [ReactRouter.Navigation],
    getInitialState: function () {
      return {};
    },
    componentWillMount: function () {

    },
    componentDidMount: function () {
      Peerio.Messages.getAllConversations();

      this.subscriptions =
        [
          Peerio.Dispatcher.onMessageAdded(function () {
            this.forceUpdate();
          }.bind(this)),
          Peerio.Dispatcher.onConversationsUpdated(this.forceUpdate.bind(this, null))
        ];
    },
    componentWillUnmount: function () {
      Peerio.Dispatcher.unsubscribe(this.subscriptions);
    },
    openConversation: function (id) {
      this.transitionTo('conversation', {id: id});
    },
    destroyConversation: function (id) {
      Peerio.Messages.removeConversation(id);
    },
    render: function () {
      var nodes = Peerio.Messages.cache
        ? this.renderNodes()
        : Peerio.UI.ItemPlaceholder.getPlaceholdersArray();

      return (
        <div className="content list-view" id="Messages" ref="messageList">
          {nodes}
        </div>
      );
    },
    renderNodes: function () {
      return Peerio.Messages.cache.map(function (conv) {
        // building name to display for conversation item.
        // it should be in format "John Smith +3"
        // and it should not display current user's name,
        // unless he is the only one left in conversation
        if (!conv.displayName) {
          var displayName = null;
          for (var i = 0; i < conv.allParticipants.length; i++) {
            var username = conv.allParticipants[i];
            if (username === Peerio.user.username) continue;
            var contact = Peerio.user.contacts[username];
            displayName = (contact && contact.fullName) || username;
            break;
          }
          displayName = displayName || Peerio.user.fullName;
          if (conv.allParticipants.length > 2) {
            displayName += ' [+' + (conv.allParticipants.length - 2) + ']';
          }
          conv.displayName = displayName;
        }

        return (
          <Peerio.UI.MessagesItem onTap={this.openConversation.bind(this, conv.id)} key={conv.id}
                                  unread={conv.isModified} fullName={conv.displayName}
                                  fileCount={conv.fileCount} timeStamp={moment(+conv.lastTimestamp)}
                                  messageCount={conv.messageCount} subject={conv.original.subject}
                                  onSwipe={this.toggleSwipe} swiped={this.state.swiped}
                                  destroyConversation={this.destroyConversation.bind(this, conv.id)}/>
        );
      }.bind(this));

    }
  });

  /**
   * Message list item component
   */
  Peerio.UI.MessagesItem = React.createClass({
    getInitialState: function () {
      return {swiped: false};
    },
    closeSwipe: function () {
      this.setState({swiped: false});
    },
    openSwipe: function () {
      this.setState({swiped: true});
    },
    destroyConversationAfterAnimate: function () {
      setTimeout(this.props.destroyConversation, 600);
    },
    destroyConversation: function () {
      this.setState({destroyAnimation: true}, this.destroyConversationAfterAnimate);
    },
    showDestroyDialog: function () {
      Peerio.Action.showConfirm({
        text: "are you sure you want do delete this conversation? You will no longer receive messages or files within this conversation.",
        onAccept: this.destroyConversation
      });
    },
    render: function () {
      var cx = React.addons.classSet;
      var classes = cx({
        'list-item': true,
        'read': this.props.read,
        'swiped': this.state.swiped,
        'list-item-animation-leave': this.state.destroyAnimation
      });
      return (
        <Peerio.UI.Tappable element="div" onTap={this.props.onTap} key={this.props.key} className={classes}>
          <Peerio.UI.Swiper onSwipeLeft={this.openSwipe} onSwipeRight={this.closeSwipe}
                            className="list-item-swipe-wrapper">

            <div className="list-item-thumb">
              {this.props.fileCount ?
                (<div className="icon-with-label">
                  <i className={'fa fa-paperclip attachment'}></i>
                  <span className="icon-label">{this.props.fileCount > 0 ? this.props.fileCount : null}</span>
                </div>)
                : ''}
            </div>

            <div className="list-item-content">
              <div className="list-item-title">{this.props.fullName}</div>
              <div className="list-item-description">{this.props.subject}</div>
            </div>

            <div className="list-item-content text-right">
              <div className="list-item-description">
                {this.props.timeStamp.format('MMM Do, YYYY')}
              </div>
              <div className="list-item-description">
                {this.props.timeStamp.format('HH:mm:ss')}
              </div>
            </div>

            <div className="list-item-forward">
              <i className="fa fa-chevron-right"></i>
            </div>

            <Peerio.UI.Tappable className="list-item-swipe-content" onTap={this.showDestroyDialog}>
              <i className="fa fa-trash-o"></i>
            </Peerio.UI.Tappable>

          </Peerio.UI.Swiper>
        </Peerio.UI.Tappable>

      );
    }
  });

}());
