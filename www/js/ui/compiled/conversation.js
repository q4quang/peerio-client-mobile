(function () {
  'use strict';

  // Main component, entry point for React app
  Peerio.UI.Conversation = React.createClass({displayName: "Conversation",
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
      this.setState({attachments: []});
    },
    handleKeyDown: function (e) {
      if (e.key === 'Enter') this.sendMessage();
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

        return (React.createElement("div", {key: username}, 
          React.createElement(Peerio.UI.Avatar, {username: username}), name));
      });
      var nodes = this.buildNodes();
      // setting flag if scroll to bottom is needed after render
      this.needsScroll = this.lastNodeCount !== nodes.length;
      this.lastNodeCount = nodes.length;
      // note: reply has fixed positioning and should not be nested in .content,
      // this causes unwanted scroll when typing into text box
      return (
        React.createElement("div", null, 
          React.createElement(Peerio.UI.ConversationHead, {subject: conversation.original.decrypted.subject, participants: participants}), 
          React.createElement("div", {className: "content with-reply-box without-tab-bar", ref: "content", key: "content"}, 
            React.createElement("div", {className: "conversation"}, 
              nodes
            )
          ), 
          React.createElement("div", {id: "reply"}, 
            React.createElement("i", {className: "fa fa-thumbs-o-up reply-ack", onTouchEnd: this.sendAck}), 
            React.createElement("input", {className: "reply-input", ref: "reply", type: "text", placeholder: "type your message...", onKeyDown: this.handleKeyDown}), 
            React.createElement("i", {className: "fa fa-paperclip reply-attach", onTouchEnd: this.openFileSelect}, this.state.attachments.length || '')
          )
        )
      );
    },
    // render helper, returns react nodes for messages
    buildNodes: function () {
      var renderStartTs = moment();
      // will be the same for all ack nodes
      var ack = (React.createElement("i", {className: "fa fa-thumbs-o-up ack-icon"}));
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
            receipts.push(React.createElement("span", {className: "receipt", key: recipient.username}, recipient.username));
          });

          if (receipts.length)
            receipts = (
              React.createElement("div", {className: "receipts"}, receipts, " ", 
                React.createElement("i", {className: "fa fa-check"})
              ));
          else
            receipts = null;
        }
        var body, thisAck;
        // ack message will have and ack icon and no body
        if (isAck) {
          thisAck = ack;
        } else {
          var filesCount = (item.decrypted.fileIDs && item.decrypted.fileIDs.length) ?
                            React.createElement("div", {className: "file-count"}, item.decrypted.fileIDs.length, " files attached.") : null;
          body = (React.createElement("div", {className: "body"}, filesCount, item.decrypted.message));
        }
        var itemClass = React.addons.classSet({
          'item': true,
          'self': isSelf,
          'ack': isAck
        });
        // ts property is passed for sorting
        nodes.push(
          React.createElement("div", {className: itemClass, ts: item.timestamp, key: item.id}, 
            React.createElement("div", {className: "head"}, 
                thisAck, 
              React.createElement("span", {className: "names"}, sender.fullName), 
              React.createElement("span", {className: "timestamp"}, 
                relativeTime
              )
            ), 
            body, 
            receipts
          )
        );
      });
      // sorting by timestamp
      nodes.sort(function (a, b) { return a.props.ts < b.props.ts ? -1 : (a.props.ts > b.props.ts ? 1 : 0); });
      return nodes;
    }
  });

  Peerio.UI.ConversationHead = React.createClass({displayName: "ConversationHead",
    getInitialState: function () {
      return {open: false};
    },
    toggle: function () {
      this.setState({open: !this.state.open});
    },
    render: function () {
      return (
        React.createElement("div", {id: "conversation-head"}, 
          React.createElement("div", {className: 'participants' + (this.state.open ? ' open' : '')}, this.props.participants), 
          React.createElement("div", {className: "counter", onTouchStart: this.toggle}, 
            React.createElement("i", {className: "fa fa-users"}), " ", this.props.participants.length
          ), 
          React.createElement("div", {className: "subject"}, this.props.subject)
        ));
    }
  });

}());
