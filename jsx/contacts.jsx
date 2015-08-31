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
            <li className="list-item" order={item.isRequest ? (item.isReceivedRequest ? 2 : 0) : 1}>
              <div className="list-item-thumb">
                <Peerio.UI.Avatar username={item.username}/>
              </div>
              <div className="list-item-content">
                <div className="list-item-title">{item.fullName}</div>
                <div className="list-item-description">{item.username} { item.isMe ? '(You)' : ''}</div>
              {item.isRequest ? (item.isReceivedRequest ? <i className="fa fa-user-plus status"></i> :
                <i className="fa fa-paper-plane-o status"></i> ) : null}
              </div>
              <div className="list-item-forward">
                <i className="fa fa-chevron-right"></i>
              </div>
            </li>
          </Peerio.UI.Tappable>
        );
      }.bind(this));
      //todo: by order, username
      return (
        <div className="content" id="contact-list">
          <ul className="list-view">
          {nodes}
          </ul>
        </div>
      );
    }
  });

}());

