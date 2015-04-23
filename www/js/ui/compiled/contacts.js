(function () {
  'use strict';

  Peerio.UI.Contacts = React.createClass({displayName: "Contacts",
    mixins: [Peerio.UI.Mixins.GlobalTap],
    getInitialState: function () {
      // we don't cache actual object in state, but a username, because it might get expired after reload
      return {openContact: null};
    },
    componentDidMount: function () {
      this.subscriptions = [
        Peerio.Dispatcher.onContactsUpdated(this.forceUpdate.bind(this, null)),
        Peerio.Dispatcher.onNavigateBack(Peerio.Helpers.getStateUpdaterFn(this, {openContact: null})),
        Peerio.Dispatcher.onAddContact(this.handleAddContact)
      ];
    },
    componentWillUnmount: function () {
      Peerio.Dispatcher.unsubscribe(this.subscriptions);
    },
    globalTapHandler: function (e) {
      var item = Peerio.Helpers.getParentWithClass(e.target, 'contact-list-item');
      if (!item || item.attributes['data-username'] == null) return;
      var username = item.attributes['data-username'].value;
      this.setState({openContact: username});
    },
    handleAddContact: function(){
      var name = prompt('Please enter username of the contact you want to add');
      if(!name) return;
      Peerio.Data.addContact(name);
    },
    render: function () {
      if (this.state.openContact)
        return ( React.createElement(Peerio.UI.ContactView, {username: this.state.openContact}));

      var nodes = [];
      _.forOwn(Peerio.user.contacts, function (item) {
        nodes.push(
          React.createElement("div", {className: "contact-list-item", "data-username": item.username, key: item.username, 
            order: item.isRequest ? (item.isReceivedRequest ? 2 : 0) : 1}, 
            React.createElement(Peerio.UI.Avatar, {size: "big", username: item.username}), 
            React.createElement("span", {className: "name"}, item.fullName), 
            React.createElement("br", null), 
            React.createElement("span", {className: "username"}, item.username), 
            item.isRequest ? (item.isReceivedRequest ? React.createElement("i", {className: "fa fa-user-plus status"}) : React.createElement("i", {className: "fa fa-paper-plane-o status"}) ) : null
          )
        );
      });

      nodes = nodes.sort(function (a, b) { return a.props.order > b.props.order ? -1 : (a.props.order < b.props.order ? 1 : 0); });
      return (
        React.createElement("div", {className: "content", id: "contact-list", onTouchStart: this.registerTouchStart, onTouchEnd: this.registerTouchEnd}, 
          nodes
        )
      );
    }
  });

  Peerio.UI.ContactView = React.createClass({displayName: "ContactView",
    componentDidMount: function () {
      Peerio.Actions.navigatedIn();
      Peerio.Actions.tabBarHide();
    },
    componentWillUnmount: function () {
      Peerio.Actions.navigatedOut();
      Peerio.Actions.tabBarShow();
    },
    handleAccept: function () {
      Peerio.Data.acceptContact(this.props.username);
    },
    handleReject: function () {
      Peerio.Data.rejectContact(this.props.username).catch();
    },
    handleRemove: function () {
      if (!confirm('Are you sure you want to remove ' + this.props.username
        + ' from contacts? You will not be able to message and share files with this contact after removal.')) return;

      Peerio.Data.removeContact(this.props.username)
        .then(Peerio.Actions.navigateBack);
    },
    render: function () {
      var c = Peerio.user.contacts[this.props.username];
      if(!c) return false;
      var buttonNode = null, pendingNode = null;
      if (c.responsePending) {
        pendingNode = React.createElement("div", {className: "pending"}, React.createElement("i", {className: "fa fa-spinner fa-pulse"}), " waiting for server response...");
      } else if (!c.isMe) {
        buttonNode = (
          React.createElement("div", null, 
             c.isRequest && c.isReceivedRequest ? React.createElement("div", {className: "btn btn-safe", onTouchEnd: this.handleAccept}, "Accept contact request") : null, 
             c.isRequest && c.isReceivedRequest ? React.createElement("div", {className: "btn btn-danger", onTouchEnd: this.handleReject}, "Reject contact request")
              : React.createElement("div", {className: "btn btn-danger", onTouchEnd: this.handleRemove}, "Remove contact")
          ));
      }
      //// TODO: replace onTouchEnd with globalTapHandler mixin. these buttons need tap event, because scroll is a possibility
      return (
        React.createElement("div", {className: "content without-tab-bar contact-view"}, 
          React.createElement("div", {className: "head"}, 
            React.createElement(Peerio.UI.Avatar, {size: "big", username: c.username, className: "contact-view-avatar"}), 
            React.createElement("span", {className: "name"}, c.fullName), 
            React.createElement("br", null), 
            React.createElement("span", {className: "username"}, c.username)
          ), 
          React.createElement("div", {className: "info-blocks"}, 
            React.createElement("div", {className: "block"}, 
              React.createElement("div", {className: "block-title"}, "MiniLockID"), 
              React.createElement("div", {className: "block-content"}, c.miniLockID)
            ), 
            React.createElement("div", {className: "block"}, 
              React.createElement("div", {className: "block-title"}, "State"), 
              React.createElement("div", {className: "block-content"},  c.isMe ? 'This is you!' :
                (c.isRequest ? 'Pending: ' + (c.isRecievedRequest ? 'you received request.' : 'you sent request')
                  : 'Established contact'))
            ), 
            React.createElement("div", {className: "block"}, 
              React.createElement("div", {className: "block-title"}, "Primary adress"), 
              React.createElement("div", {className: "block-content"}, c.primaryAddress || 'N/A')
            )
          ), 
          pendingNode || buttonNode
        )
      );

    }
  });

}());

