(function () {
  'use strict';

  Peerio.UI.ContactSelect = React.createClass({
    mixins: [ReactRouter.Navigation],
    getInitialState: function () {
      return {selection: this.props.preselected || []};
    },
    toggle: function (username) {

      this.setState(function (prevState) {
        var ind = prevState.selection.indexOf(username);
        if (ind >= 0)
          prevState.selection.splice(ind, 1);
        else
          prevState.selection.push(username);
      });
    },
    accept: function(){
      Peerio.Action.contactsSelected(this.state.selection);
      this.props.onClose();
    },
    addContact: function(){
      Peerio.Action.transitionTo('contacts', null, {trigger: true});
      this.props.onClose();
    },
    render: function () {
      var contacts = [];
      Peerio.user.contacts.arr.forEach(function (c) {
        if (c.isRequest) return;
        var isSelected = this.state.selection.indexOf(c.username) >= 0 ;

        contacts.push(
            <Peerio.UI.Tappable element="li" onTap={this.toggle.bind(this, c.username)} key={c.username}>
                <Peerio.UI.Avatar username={c.username} className="flex-shrink-0"/>
                <div className="text-overflow">{c.fullName}</div>
                <div className="caption flex-grow-1 margin-small">({c.username})</div>
                <div type="checkbox" className={isSelected ? 'checkbox-input checked' : 'checkbox-input' }></div>
            </Peerio.UI.Tappable>
        );
      }.bind(this));

        if (Peerio.user.contacts.arr.length === 1) {
          var intro_content = (<div className="content-intro">
                                <div className="headline">Peerio Contacts</div>
                                <p>It looks like you have not added any contacts yet. Click below to get started.</p>
                                <Peerio.UI.Tappable element="div" className="btn-primary" onTap={this.addContact}>
                                  <i className="fa fa-user-plus"></i>Add a contact
                                </Peerio.UI.Tappable>
                                <img src="media/img/contacts.png"/>
                              </div>);
          contacts.push(intro_content);
        }

      return (
        <div className="modal item-select">
            <div className="subhead">
            Select your recipients
          </div>
          <ul>
            {contacts}
          </ul>
          <div className="buttons flex-col">
            <Peerio.UI.Tappable element="div" className="btn-safe" onTap={this.accept}>OK</Peerio.UI.Tappable>
            <Peerio.UI.Tappable element="div" className="btn-dark" onTap={this.props.onClose}>Cancel</Peerio.UI.Tappable>
          </div>
        </div>
      );
    }
  });

}());
