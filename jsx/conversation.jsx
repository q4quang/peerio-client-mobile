(function () {
  'use strict';

  // Main component, entry point for React app
  Peerio.UI.Conversation = React.createClass({
    //----- REACT EVENTS
    getInitialState: function () {
      return {
        // unsent attachments to the message that will be sent next, if user taps "send"
        attachments: []
      };
    },
    componentWillMount: function () {
      this.conversation = Peerio.user.conversations[this.props.conversationId];
    },
    componentDidMount: function () {
      this.scrollToBottom();
      // subscribing to events
      Peerio.Dispatcher.onMessageSentStatus(this.rerender);
      Peerio.Dispatcher.onConversationUpdated(this.rerender);
      Peerio.Dispatcher.onMessagesUpdated(this.rerender);
      Peerio.Dispatcher.onSendCurrentMessage(this.sendMessage);
      Peerio.Dispatcher.onFilesSelected(this.handleFilesSelected);
      // todo: ugly hack, make it better
      var c = Peerio.user.conversations[this.props.conversationId];
      if (!c.isLoaded) {
        c.isLoaded = true;
        // requesting update for the thread from server
        Peerio.Data.refreshConversation(this.props.conversationId);
      }
      // tabbar not needed here
      Peerio.Actions.tabBarHide();
      // to update relative timestamps
      this.renderInterval = window.setInterval(this.forceUpdate.bind(this), 20000);
    },
    componentWillUnmount: function () {
      window.clearInterval(this.renderInterval);
      Peerio.Dispatcher.unsubscribe(this.rerender, this.sendMessage, this.handleFilesSelected);
      Peerio.Actions.tabBarShow();
    },
    componentDidUpdate: function () {
      this.scrollToBottom();
    },
    //----- CUSTOM FN
    rerender: function () {
      this.forceUpdate();
    },
    handleFilesSelected: function (selection) {
      this.setState({attachments: selection});
    },
    sendAck: function () {
      Peerio.Data.sendMessage(this.conversation, Peerio.ACK_MSG);
    },
    sendMessage: function () {
      var node = this.refs.reply.getDOMNode();
      if (node.value.isEmpty()) return;
      Peerio.Data.sendMessage(this.conversation, node.value, uuid.v4(), this.state.attachments);
      node.value = '';
      this.resizeTextAreaAsync();
      this.setState({attachments: []});
    },
    resizeTextAreaAsync: function () {
      setTimeout(this.resizeTextArea, 0);
    },
    // grows textarea height with content up to max-height css property value
    // or shrinks down to 1 line
    resizeTextArea: function(){
      var node = this.refs.reply.getDOMNode();
      node.style.height = 'auto';
      node.style.height = node.scrollHeight+'px';
    },
    openFileSelect: function () {
      Peerio.Actions.showFileSelect(this.state.attachments.slice());
    },
    scrollToBottom: function () {
      if (!this.needsScroll) return;
      this.needsScroll = false;
      TweenLite.to(this.refs.content.getDOMNode(), .5, {scrollTo: {y: 'max'}});
    },
    //----- RENDER
    render: function () {
      // todo: more sophisticated logic for sending receipts, involving scrolling message into view detection
      // todo: also not trying to send receipts that were already sent?
      Peerio.Data.sendReceipts(this.props.conversationId);
      var conversation = Peerio.user.conversations[this.props.conversationId];
      var participants = _.without(conversation.participants, Peerio.user.username).map(function (username) {
        var name;
        var c = Peerio.user.contacts[username];
        if (c)
          name = c.fullName + ' (' + username + ') ';
        else
          name = username;

        return (<div key={username}>
          <Peerio.UI.Avatar username={username}/>{name}</div>);
      });
      var nodes = this.buildNodes();
      // setting flag if scroll to bottom is needed after render
      this.needsScroll = this.lastNodeCount !== nodes.length;
      this.lastNodeCount = nodes.length;
      // note: reply has fixed positioning and should not be nested in .content,
      // this causes unwanted scroll when typing into text box
      return (
        <div>
          <Peerio.UI.ConversationHead subject={conversation.original.decrypted.subject} participants={participants}/>

          <div className="content with-reply-box without-tab-bar" ref="content" key="content">
            <div className="conversation">
              {nodes}
            </div>
          </div>
          <div id="reply">
            <div className="reply-ack">
              <i className="fa fa-thumbs-o-up icon-btn" onTouchEnd={this.sendAck}></i>
            </div>
            <textarea className="reply-input" rows="1" ref="reply" onKeyUp={this.resizeTextArea} onChange={this.resizeTextArea}></textarea>

            <div className="reply-attach">
              <i className="fa fa-paperclip icon-btn"
                 onTouchEnd={this.openFileSelect}>{this.state.attachments.length || ''}</i>
            </div>
          </div>
        </div>
      );
    },
    // render helper, returns react nodes for messages
    buildNodes: function () {
      var renderStartTs = moment();
      // will be the same for all ack nodes
      var ack = (<i className="fa fa-thumbs-o-up ack-icon"></i>);
      var nodes = [];

      Peerio.Helpers.forEachMessage(this.props.conversationId, function (item) {
        // figuring out render details
        var sender = Peerio.user.contacts[item.sender];
        // mocking contact for deleted contacts
        if (!sender) {
          sender = {username: item.sender, fullName: item.sender};
        }
        var relativeTime = moment.min(renderStartTs, moment(+item.timestamp)).fromNow();
        var isAck = item.decrypted.message === Peerio.ACK_MSG;
        var isSelf = Peerio.user.username === sender.username;

        // will be undefined or ready to render root element for receipts
        var receipts;
        // does this node need receipts?
        if (isSelf) {
          receipts = [];

          item.recipients.forEach(function (recipient) {
            if (!recipient.receipt || !recipient.receipt.isRead || Peerio.user.username === recipient.username) return;
            receipts.push(<span className="receipt" key={recipient.username}>{recipient.username}</span>);
          });

          if (receipts.length)
            receipts = (
              <div className="receipts">{receipts}&nbsp;
                <i className="fa fa-check"></i>
              </div>);
          else
            receipts = null;
        }
        var body, thisAck;
        // ack message will have and ack icon and no body
        if (isAck) {
          thisAck = ack;
        } else {
          var filesCount = (item.decrypted.fileIDs && item.decrypted.fileIDs.length) ?
            <div className="file-count">{item.decrypted.fileIDs.length} files attached.</div> : null;
          body = (<div className="body">{filesCount}{item.decrypted.message}</div>);
        }
        var itemClass = React.addons.classSet({
          'item': true,
          'self': isSelf,
          'ack': isAck
        });
        // ts property is passed for sorting
        nodes.push(
          <div className={itemClass} ts={item.timestamp} key={item.id}>
            <div className="head">
              {thisAck}
              <span className="names">{sender.fullName}</span>
              <span className="timestamp">
                {relativeTime}
              </span>
            </div>
            {body}
            {receipts}
          </div>
        );
      });
      // sorting by timestamp
      nodes.sort(function (a, b) { return a.props.ts < b.props.ts ? -1 : (a.props.ts > b.props.ts ? 1 : 0); });
      return nodes;
    }
  });

  Peerio.UI.ConversationHead = React.createClass({
    getInitialState: function () {
      return {open: false};
    },
    toggle: function () {
      this.setState({open: !this.state.open});
    },
    render: function () {
      return (
        <div id="conversation-head">
          <div className={'participants' + (this.state.open ? ' open' : '')}>{this.props.participants}</div>
          <div className="counter" onTouchStart={this.toggle}>
            <i className="fa fa-users"></i> {this.props.participants.length}
          </div>
          <div className="subject">{this.props.subject}</div>
        </div>);
    }
  });

}());
