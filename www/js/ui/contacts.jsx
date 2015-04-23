(function () {
  'use strict';

  Peerio.UI.Contacts = React.createClass({
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
        return ( <Peerio.UI.ContactView username={this.state.openContact}></Peerio.UI.ContactView>);

      var nodes = [];
      _.forOwn(Peerio.user.contacts, function (item) {
        nodes.push(
          <div className="contact-list-item" data-username={item.username} key={item.username}
            order={item.isRequest ? (item.isReceivedRequest ? 2 : 0) : 1}>
            <Peerio.UI.Avatar size="big" username={item.username}/>
            <span className="name">{item.fullName}</span>
            <br/>
            <span className="username">{item.username}</span>
            {item.isRequest ? (item.isReceivedRequest ? <i className="fa fa-user-plus status"></i> : <i className="fa fa-paper-plane-o status"></i> ) : null}
          </div>
        );
      });

      nodes = nodes.sort(function (a, b) { return a.props.order > b.props.order ? -1 : (a.props.order < b.props.order ? 1 : 0); });
      return (
        <div className="content" id="contact-list" onTouchStart={this.registerTouchStart} onTouchEnd={this.registerTouchEnd}>
          {nodes}
        </div>
      );
    }
  });

  Peerio.UI.ContactView = React.createClass({
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
        pendingNode = <div className="pending"><i className="fa fa-spinner fa-pulse"></i> waiting for server response...</div>;
      } else if (!c.isMe) {
        buttonNode = (
          <div>
            { c.isRequest && c.isReceivedRequest ? <div className="btn btn-safe" onTouchEnd={this.handleAccept}>Accept contact request</div> : null }
            { c.isRequest && c.isReceivedRequest ? <div className="btn btn-danger" onTouchEnd={this.handleReject}>Reject contact request</div>
              : <div className="btn btn-danger" onTouchEnd={this.handleRemove}>Remove contact</div>}
          </div>);
      }
      //// TODO: replace onTouchEnd with globalTapHandler mixin. these buttons need tap event, because scroll is a possibility
      return (
        <div className="content without-tab-bar contact-view">
          <div className="head">
            <Peerio.UI.Avatar size="big" username={c.username} className="contact-view-avatar"/>
            <span className="name">{c.fullName}</span>
            <br/>
            <span className="username">{c.username}</span>
          </div>
          <div className="info-blocks">
            <div className="block">
              <div className="block-title">MiniLockID</div>
              <div className="block-content">{c.miniLockID}</div>
            </div>
            <div className="block">
              <div className="block-title">State</div>
              <div className="block-content">{ c.isMe ? 'This is you!' :
                (c.isRequest ? 'Pending: ' + (c.isRecievedRequest ? 'you received request.' : 'you sent request')
                  : 'Established contact')}</div>
            </div>
            <div className="block">
              <div className="block-title">Primary adress</div>
              <div className="block-content">{c.primaryAddress || 'N/A'}</div>
            </div>
          </div>
          {pendingNode || buttonNode}
        </div>
      );

    }
  });

}());

