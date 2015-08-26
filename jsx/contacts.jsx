(function () {
  'use strict';

  Peerio.UI.Contacts = React.createClass({
    mixins:[ReactRouter.Navigation],
    handleAddContact: function () {
      var name = prompt('Please enter username of the contact you want to add');
      if (!name) return;
      //Peerio.Data.addContact(name);
      console.log('todo: add contact');
    },
    openContactView: function(id){
      this.transitionTo('contact',{id:id})
    },
    render: function () {
      var nodes = [];
      Peerio.user.contacts.forEach(function (item) {
        nodes.push(
          <Peerio.UI.Tappable onTap={this.openContactView.bind(this, item.username)} key={item.username}>
            <div className="contact-list-item" order={item.isRequest ? (item.isReceivedRequest ? 2 : 0) : 1}>
              <Peerio.UI.Avatar size="big" username={item.username}/>
              <span className="name">{item.fullName}</span>
              <br/>
              <span className="username">{item.username} { item.isMe ? '(You)' : ''}</span>
              {item.isRequest ? (item.isReceivedRequest ? <i className="fa fa-user-plus status"></i> :
                <i className="fa fa-paper-plane-o status"></i> ) : null}
            </div>
          </Peerio.UI.Tappable>
        );
      }.bind(this));
      //todo: by order, username
      nodes = nodes.sort(function (a, b) { return a.props.order > b.props.order ? -1 : (a.props.order < b.props.order ? 1 : 0); });
      return (
        <div className="content" id="contact-list">
          {nodes}
        </div>
      );
    }
  });

}());

