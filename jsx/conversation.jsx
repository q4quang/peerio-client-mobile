(function () {
  'use strict';

  // Main component, entry point for React app
  Peerio.UI.Conversation = React.createClass({
    mixins: [ReactRouter.Navigation, ReactRouter.State],
    //----- REACT EVENTS
    getInitialState: function () {
      return {
        // unsent attachments to the message that will be sent next, if user taps "send"
        attachments: []
      };
    },
    componentWillMount: function () {
      this.setState({conversation: Peerio.Messages.cache[this.props.params.id]});
    },
    componentDidMount: function () {

      Peerio.Messages.markAsRead(this.state.conversation);

      this.subscriptions = [

        Peerio.Dispatcher.onMessageAdded(function (conversationID) {
          if (this.props.params.id === conversationID) {
            this.forceUpdate();
            Peerio.Messages.markAsRead(this.state.conversation);
          }
        }.bind(this)),

        Peerio.Dispatcher.onReceiptAdded(function (conversationID) {
          if (this.props.params.id === conversationID) {
            this.forceUpdate();
            //Peerio.Messages.markAsRead(this.state.conversation);
          }
        }.bind(this)),

        Peerio.Dispatcher.onBigGreenButton(this.sendMessage),
        Peerio.Dispatcher.onFilesSelected(this.acceptFileSelection)

      ];

      Peerio.Messages.loadAllConversationMessages(this.props.params.id)
        .then(this.forceUpdate.bind(this, null))
        .then(function(){
          Peerio.Messages.markAsRead(this.state.conversation);
        }.bind(this));
      // to update relative timestamps
      this.renderInterval = window.setInterval(this.forceUpdate.bind(this), 20000);

      this.disableIfLastParticipant();

    },
    componentWillUnmount: function () {
      window.clearInterval(this.renderInterval);
      Peerio.Dispatcher.unsubscribe(this.subscriptions);
    },
    componentDidUpdate: function () {
      this.scrollToBottom();
    },
    //----- CUSTOM FN
    openFileSelect: function () {
      Peerio.Action.showFileSelect({preselected: this.state.attachments.slice()});
    },
    acceptFileSelection: function (selection) {
      this.setState({attachments: selection});
    },

    sendAck: function () {
      Peerio.Messages.sendACK(this.state.conversation);
    },
    sendMessage: function () {
      var node = this.refs.reply.getDOMNode();
      if (node.value.isEmpty()) return;
      Peerio.Messages.sendMessage(this.state.conversation.participants, '', node.value, this.state.attachments, this.state.conversation.id);
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
    scrollToBottom: function () {
      if (!this.refs.content)return;
      TweenLite.to(this.refs.content.getDOMNode(), .5, {scrollTo: {y: 'max'}});
    },
    disableIfLastParticipant: function(){
      /* If user is last participant in conversation, disable text entry */
      /* unless the user started a conversation with themselves. */
      var moreThanOneParticipant = this.state.conversation.allParticipants;
      var noParticipantsLeft = _.without(this.state.conversation.participants, Peerio.user.username).length == 0;

      if (moreThanOneParticipant.length > 1 && noParticipantsLeft) {
        this.setState({textEntryDisabled: true, placeholderText: "There are no participants left in this conversation"});
      } else if (moreThanOneParticipant.length == 1){
        this.setState({ placeholderText: "You are the only person in this conversation."});
      } else {
        this.setState({placeholderText: "Type your message..."});
      }
    },
    //----- RENDER
    render: function () {
      // todo: more sophisticated logic for sending receipts, involving scrolling message into view detection
      // todo: also not trying to send receipts that were already sent?
      //Peerio.Data.sendReceipts(this.props.conversationId);
      // todo: loading state
      if (!this.state.conversation) return null;
      var conversation = this.state.conversation;
      var participants = _.without(conversation.participants, Peerio.user.username).map(function (username) {
        return (
          <div key={username}>
            <Peerio.UI.Avatar username={username}/>{Peerio.Contacts.getFullNameAndUsername(username)}
          </div>
        );
      });
      conversation.formerParticipants.forEach(function (username) {
        participants.push(
          <div key={username} className='former-participant'>
            <Peerio.UI.Avatar username={username}/>{Peerio.Contacts.getFullNameAndUsername(username)}
          </div>
        );
      });

      var nodes = this.buildNodes();
      // note: reply has fixed positioning and should not be nested in .content,
      // this causes unwanted scroll when typing into text box
      return (
        <div>
          <Peerio.UI.ConversationHead subject={conversation.original.subject} participants={participants}
                                      activeParticipantsCount={conversation.participants.length}
                                      allParticipantsCount={conversation.allParticipants.length}
                                      conversationId={conversation.id}/>

          <div className="content with-reply-box without-tab-bar" ref="content" key="content">
            <div className="conversation">
              {nodes}
            </div>
          </div>
          <div id="reply">
            <div className="reply-ack">
              <i className="fa fa-thumbs-o-up icon-btn" onTouchEnd={this.sendAck}></i>
            </div>

            <textarea className={this.state.textEntryDisabled ?  "reply-input placeholder-warning":"reply-input"} rows="1" ref="reply" placeholder={this.state.placeholderText} onKeyUp={this.resizeTextArea}
                     disabled={this.state.textEntryDisabled} onChange={this.resizeTextArea}></textarea>

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

      this.state.conversation.messages.forEach(function (item, index) {
        // figuring out render details
        var sender = Peerio.user.contacts[item.sender];
        // mocking contact for deleted contacts todo: ugly!
        if (!sender) {
          sender = {username: item.sender, fullName: item.sender};
        }

        var prevMessage = index ? this.state.conversation.messages[index - 1] : false;
        var isSameDay = moment(item.timestamp).isSame(prevMessage.timestamp, 'day');

        var momentTimestamp = moment(+item.timestamp);
        var relativeTime = moment.min(renderStartTs, momentTimestamp).fromNow();

        var messageDate = (momentTimestamp.isSame(renderStartTs, 'year')) ? momentTimestamp.format("MMM Do") : momentTimestamp.format("MMM Do YYYY");

        var isAck = item.message === Peerio.ACK_MSG;
        var isSelf = Peerio.user.username === sender.username;

        var timestampHTML = ( isSameDay ) ? false :
          <div className="timestamp">{relativeTime}&nbsp;&bull;&nbsp;{messageDate}</div>;

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

        var avatarHTML = (isSelf) ? false : <Peerio.UI.Avatar username={sender.username}/>;

        nodes.push(
          <div className={itemClass} ts={item.timestamp} key={item.id}>
            {timestampHTML}
            <div className="head">
              {thisAck}
              {avatarHTML}
              <span className="names">{sender.fullName}</span>
            </div>
            {body}
            {receipts}
          </div>
        );
      }.bind(this));

      return nodes;
    }
  });

  Peerio.UI.ConversationHead = React.createClass({
    mixins: [ReactRouter.Navigation, ReactRouter.State],
    getInitialState: function () {
      return {open: false};
    },
    toggle: function () {
      this.setState({open: !this.state.open});
    },
    openInfo: function(event){
      event.preventDefault();
      this.transitionTo('conversation_info', {id: this.props.conversationId});
    },
    render: function () {
      var counter = this.props.allParticipantsCount - 1;
      if (this.props.activeParticipantsCount !== this.props.allParticipantsCount) {
        counter = this.props.activeParticipantsCount - 1 + '/' + counter;
      }
      return (
        <Peerio.UI.Tappable onTap={this.toggle}>
          <div id="conversation-head">
            <div className={'participants' + (this.state.open ? ' open' : '')}>{this.props.participants}</div>

            <div className="counter">
              <i className="fa fa-users"></i> {counter}
            </div>
            <Peerio.UI.Tappable onTap={this.openInfo}>
              <i className="info fa fa-info-circle"></i>
            </Peerio.UI.Tappable>

            <div className="subject">{this.props.subject}</div>
          </div>
        </Peerio.UI.Tappable>
      );
    }
  });

}());
