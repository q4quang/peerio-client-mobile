(function () {
  'use strict';

  Peerio.UI.NewMessage = React.createClass({
    mixins: [ ],
    //--- REACT EVENTS
    getInitialState: function () {
      return {showContactSelect: false, recipients: [], attachments: []};
    },
    componentDidMount: function () {
      Peerio.Dispatcher.onFilesSelected(this.handleFilesSelected);
     // Peerio.Dispatcher.onNavigateBack(this.handleNavigateBack);
     // Peerio.Action.navigatedIn('send', this.send);
      Peerio.Action.tabBarHide();
    },
    componentWillUnmount: function () {
      Peerio.Dispatcher.unsubscribe(this.handleNavigateBack, this.handleFilesSelected);
     // Peerio.Action.navigatedOut();
      Peerio.Action.tabBarShow();
    },
    //--- CUSTOM FN
    send: function () {
      //todo validation
      Peerio.Data.sendNewMessage(this.state.recipients, this.refs.subject.getDOMNode().value, this.refs.message.getDOMNode().value, this.state.attachments);
      Peerio.Action.newMessageViewClose();
    },
    // todo: this is quite ugly, change it to the way file selector is made
    handleNavigateBack: function () {
      if (this.state.showContactSelect) {
        this.setState({showContactSelect: false});
       // Peerio.Action.navigatedOut();
      } else Peerio.Action.newMessageViewClose();
    },
    openContactSelect: function () {
      this.recipientsCopy = this.state.recipients.slice();
    //  Peerio.Action.navigatedIn('Ok', this.acceptContactSelection);
      this.setState({showContactSelect: true});
    },
    acceptContactSelection: function () {
      this.setState({recipients: this.recipientsCopy});
      this.handleNavigateBack();
    },
    openFileSelect: function () {
      Peerio.Action.showFileSelect(this.state.attachments.slice());
    },
    handleFilesSelected: function (selection) {
      this.setState({attachments: selection});
    },
    globalTapHandler : function(e){
      this.openContactSelect();
    },

    //--- RENDER
    render: function () {
      var r = this.state.recipients.map(function (username) {
        var c = Peerio.user.contacts[username];
        return <span>{c.fullName} ({username});</span>;
      });
      return (
        <div className="content without-tab-bar">
          <div id="new-message">
            <div className="recipients" onTouchStart={this.registerTouchStart} onTouchEnd={this.registerTouchEnd}>
              <div className="to">To:</div>
              <div className="names">{r}</div>
              <div className="add-btn">
                <i className="fa fa-list"></i>
                <span className={'icon-counter' + (this.state.recipients.length ? '' : ' hide')}>{this.state.recipients.length}</span>
              </div>
            </div>
            <input type="text" ref="subject" className="subject" placeholder="Subject"/>
            <div className="attach-btn" onTouchEnd={this.openFileSelect}>
              <i className="fa fa-paperclip"></i>
              <span className={'icon-counter' + (this.state.attachments.length ? '' : ' hide')}>{this.state.attachments.length}</span>
            </div>
            <textarea ref="message" className="message" placeholder="Type your message"></textarea>
          </div>
        { this.state.showContactSelect ?
          <div className="contact-select-container">
            <Peerio.UI.ContactSelect selection={this.recipientsCopy}/>
          </div>
          : null
          }
        </div>
      );
    }
  });

  Peerio.UI.ContactSelect = React.createClass({
    mixins: [],
    globalTapHandler: function (e) {
      var item = Peerio.Helpers.getParentWithClass(e.target, 'contact');
      if (!item) return;
      this.toggle(item.attributes['data-username'].value);
    },
    toggle: function (username) {
      var ind = this.props.selection.indexOf(username);
      if (ind >= 0)
        this.props.selection.splice(ind, 1);
      else
        this.props.selection.push(username);

      this.forceUpdate();

    },
    render: function () {
      var contacts = [];
      Peerio.Helpers.forEachContact(function (c) {
        if (c.username === Peerio.user.username || c.isRequest) return;
        var checkMark = this.props.selection.indexOf(c.username) >= 0
          ? (<i className="fa fa-check-circle"></i>) : '';

        contacts.push(
          <li className="contact" data-username={c.username} key={c.username}>
            {checkMark}
            <Peerio.UI.Avatar username={c.username}/> {c.fullName}
            <span className="username">({c.username})</span>
          </li>
        );
      }.bind(this));
      return (
        <ul className="contact-select" onTouchStart={this.registerTouchStart} onTouchEnd={this.registerTouchEnd}>
          {contacts}
        </ul>
      );
    }
  });
}());