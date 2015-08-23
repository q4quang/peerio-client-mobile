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
    componentDidMount: function () {
      var id = this.props.params.id;
      Peerio.Messages.loadAllConversationMessages(id).then(this.forceUpdate.bind(this, null));
      Peerio.Messages.getAllConversations().then(function (conversations) {
        if (!this.isMounted()) return;
        this.setState({conversation: conversations[id]}, this.scrollToBottom);

      }.bind(this));
      // to update relative timestamps
      this.renderInterval = window.setInterval(this.forceUpdate.bind(this), 20000);
    },
    componentWillUnmount: function () {
      window.clearInterval(this.renderInterval);
    },
    componentDidUpdate: function () {
      this.scrollToBottom();
    },
    //----- CUSTOM FN
    handleFilesSelected: function (selection) {
      this.setState({attachments: selection});
    },
    sendAck: function () {
      Peerio.Data.sendMessage(this.state.conversation, Peerio.ACK_MSG);
    },
    sendMessage: function () {
      var node = this.refs.reply.getDOMNode();
      if (node.value.isEmpty()) return;
      Peerio.Messages.sendMessage(this.state.conversation, node.value, uuid.v4(), this.state.attachments);
      node.value = '';
      this.resizeTextAreaAsync();
      this.setState({attachments: []});
    },
    resizeTextAreaAsync: function () {
      setTimeout(this.resizeTextArea, 0);
    },
    // grows textarea height with content up to max-height css property value
    // or shrinks down to 1 line
    resizeTextArea: function () {
      var node = this.refs.reply.getDOMNode();
      node.style.height = 'auto';
      node.style.height = node.scrollHeight + 'px';
    },
    openFileSelect: function () {
      //Peerio.Action.showFileSelect(this.state.attachments.slice());
    },
    scrollToBottom: function () {
      if(!this.refs.content)return;
      TweenLite.to(this.refs.content.getDOMNode(), .5, {scrollTo: {y: 'max'}});
    },
    //----- RENDER
    render: function () {
      // todo: more sophisticated logic for sending receipts, involving scrolling message into view detection
      // todo: also not trying to send receipts that were already sent?
      //Peerio.Data.sendReceipts(this.props.conversationId);
      // todo: loading state
      if (!this.state.conversation) return (<h1>loading...</h1>);
      var conversation = this.state.conversation;
      var participants = _.without(conversation.participants, Peerio.user.username).map(function (username) {
        var name;
        var c = Peerio.user.contacts[username];
        if (c)
          name = c.fullName + ' (' + username + ') ';
        else
          name = username;

        return (
          <div key={username}>
            <Peerio.UI.Avatar username={username}/>{name}
          </div>
        );
      });

      var nodes = this.buildNodes();
      // note: reply has fixed positioning and should not be nested in .content,
      // this causes unwanted scroll when typing into text box
      return (
        <div>
          <Peerio.UI.ConversationHead subject={conversation.subject} participants={participants}/>

          <div className="content with-reply-box without-tab-bar" ref="content" key="content">
            <div className="conversation">
              {nodes}
            </div>
          </div>
          <div id="reply">
            <div className="reply-ack">
              <i className="fa fa-thumbs-o-up icon-btn" onTouchEnd={this.sendAck}></i>
            </div>
            <textarea className="reply-input" rows="1" ref="reply" onKeyUp={this.resizeTextArea}
                      onChange={this.resizeTextArea}></textarea>

            <div className="reply-attach">
              <i className="fa fa-paperclip icon-btn"
                 onTouchEnd={this.openFileSelect}>{this.state.attachments.length || ''}</i>
            </div>
          </div>
        </div>
      );
    },
    sanitizingOptions: {ALLOWED_TAGS: [], ALLOWED_ATTR: []},
    autolinker: new Autolinker({
      twitter: false,
      replaceFn: function (autolinker, match) {
        var tag = autolinker.getTagBuilder().build(match);
        tag.setAttr('onclick', "javascript:Peerio.NativeAPI.openInBrowser('" + match.getAnchorHref() + "');event.preventDefault()");
        tag.setAttr('href', '#');
        return tag;
      }
    }),
    processBody: function (body) {
      body = DOMPurify.sanitize(body, this.sanitizingOptions);
      body = this.autolinker.link(body);
      return {__html: body};
    },
    // render helper, returns react nodes for messages
    buildNodes: function () {
      var renderStartTs = moment();
      // will be the same for all ack nodes
      var ack = (<i className="fa fa-thumbs-o-up ack-icon"></i>);
      var nodes = [];

      this.state.conversation.messages.forEach(function (item) {
        // figuring out render details
        var sender = Peerio.user.contacts[item.sender];
        // mocking contact for deleted contacts
        if (!sender) {
          sender = {username: item.sender, fullName: item.sender};
        }
        var relativeTime = moment.min(renderStartTs, moment(+item.timestamp)).fromNow();
        var isAck = item.message === Peerio.ACK_MSG;
        var isSelf = Peerio.user.username === sender.username;

        // will be undefined or ready to render root element for receipts
        var receipts;
        // does this node need receipts?
        if (isSelf) {
          receipts = [];

          item.receipts.forEach(function (recipient) {
            receipts.push(<span className="receipt" key={recipient}>{recipient}</span>);
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
          var filesCount = (item.fileIDs && item.fileIDs.length) ?
            <div className="file-count">{item.fileIDs.length} files attached.</div> : null;
          body = (<div className="body">{filesCount}
            <span dangerouslySetInnerHTML={this.processBody(item.message)}></span>
          </div>);
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
      }.bind(this));
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
