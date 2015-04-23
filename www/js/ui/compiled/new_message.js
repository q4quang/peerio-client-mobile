(function () {
  'use strict';

  Peerio.UI.NewMessage = React.createClass({displayName: "NewMessage",
    //--- REACT EVENTS
    getInitialState: function () {
      return {showContactSelect: false, recipients: [], attachments: []};
    },
    componentDidMount: function () {
      Peerio.Dispatcher.onFilesSelected(this.handleFilesSelected);
      Peerio.Dispatcher.onNavigateBack(this.handleNavigateBack);
      Peerio.Actions.navigatedIn('send', this.send);
      Peerio.Actions.tabBarHide();
    },
    componentWillUnmount: function () {
      Peerio.Dispatcher.unsubscribe(this.handleNavigateBack, this.handleFilesSelected);
      Peerio.Actions.navigatedOut();
      Peerio.Actions.tabBarShow();
    },
    //--- CUSTOM FN
    send: function () {
      //todo validation
      Peerio.Data.sendNewMessage(this.state.recipients, this.refs.subject.getDOMNode().value, this.refs.message.getDOMNode().value, this.state.attachments);
      Peerio.Actions.newMessageViewClose();
    },
    // todo: this is quite ugly, change it to the way file selector is made
    handleNavigateBack: function () {
      if (this.state.showContactSelect) {
        this.setState({showContactSelect: false});
        Peerio.Actions.navigatedOut();
      } else Peerio.Actions.newMessageViewClose();
    },
    openContactSelect: function () {
      this.recipientsCopy = this.state.recipients.slice();
      Peerio.Actions.navigatedIn('Ok', this.acceptContactSelection);
      this.setState({showContactSelect: true});
    },
    acceptContactSelection: function () {
      this.setState({recipients: this.recipientsCopy});
      this.handleNavigateBack();
    },
    openFileSelect: function () {
      Peerio.Actions.showFileSelect(this.state.attachments.slice());
    },
    handleFilesSelected: function (selection) {
      this.setState({attachments: selection});
    },

    //--- RENDER
    render: function () {
      var r = this.state.recipients.map(function (username) {
        var c = Peerio.user.contacts[username];
        return React.createElement("span", null, c.fullName, " (", username, ");");
      });
      return (
        React.createElement("div", {className: "content without-tab-bar"}, 
          React.createElement("div", {id: "new-message"}, 
            React.createElement("div", {className: "recipients"}, 
              React.createElement("div", {className: "to"}, "To:"), 
              React.createElement("div", {className: "names"}, r), 
              React.createElement("div", {className: "add-btn", onTouchEnd: this.openContactSelect}, 
                React.createElement("i", {className: "fa fa-list"}), 
                React.createElement("span", {className: 'icon-counter' + (this.state.recipients.length ? '' : ' hide')}, this.state.recipients.length)
              )
            ), 
            React.createElement("input", {type: "text", ref: "subject", className: "subject", placeholder: "Subject"}), 
            React.createElement("div", {className: "attach-btn", onTouchEnd: this.openFileSelect}, 
              React.createElement("i", {className: "fa fa-paperclip"}), 
              React.createElement("span", {className: 'icon-counter' + (this.state.attachments.length ? '' : ' hide')}, this.state.attachments.length)
            ), 
            React.createElement("textarea", {ref: "message", className: "message", placeholder: "Type your message"})
          ), 
         this.state.showContactSelect ?
          React.createElement("div", {className: "contact-select-container"}, 
            React.createElement(Peerio.UI.ContactSelect, {selection: this.recipientsCopy})
          )
          : null
          
        )
      );
    }
  });

  Peerio.UI.ContactSelect = React.createClass({displayName: "ContactSelect",
    mixins: [Peerio.UI.Mixins.GlobalTap],
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
        if (c.username === Peerio.user.username) return;
        var checkMark = this.props.selection.indexOf(c.username) >= 0
          ? (React.createElement("i", {className: "fa fa-check-circle"})) : '';

        contacts.push(
          React.createElement("li", {className: "contact", "data-username": c.username, key: c.username}, 
            checkMark, 
            React.createElement(Peerio.UI.Avatar, {username: c.username}), " ", c.fullName, 
            React.createElement("span", {className: "username"}, "(", c.username, ")")
          )
        );
      }.bind(this));
      return (
        React.createElement("ul", {className: "contact-select", onTouchStart: this.registerTouchStart, onTouchEnd: this.registerTouchEnd}, 
          contacts
        )
      );
    }
  });
}());