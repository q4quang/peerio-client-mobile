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
    render: function () {
      var contacts = [];
      Peerio.user.contacts.forEach(function (c) {
        if (c.isRequest) return;
        var isSelected = this.state.selection.indexOf(c.username) >= 0 ;

        contacts.push(
            <Peerio.UI.Tappable onTap={this.toggle.bind(this, c.username)} key={c.username}>
              <li className={isSelected ? 'contact selected' : 'contact'}>
                <span type="checkbox" className={isSelected ? 'checkbox-input checked' : 'checkbox-input' }></span>
                <Peerio.UI.Avatar username={c.username}/> {c.fullName}
                <span className="username">({c.username})</span>
              </li>
            </Peerio.UI.Tappable>
        )
      }.bind(this));

        if (Peerio.user.contacts.length === 1) {
          var intro_content = (<div className="content-intro">
                                <h1 className="headline-lrg">Peerio Contacts</h1>
                                <p>It looks like you haven't added any contacts yet. Click below to get started.</p>
                                <Peerio.UI.Tappable element="div" className="btn-md" onTap={this.transitionTo.bind(this, 'contacts')}>
                                  <i className="fa fa-user-plus"></i>&nbsp;Add a contact
                                </Peerio.UI.Tappable>
                                <img src="media/img/contacts.png"/>
                              </div>);
          contacts.push(intro_content);
        }

      return (
        <div className="modal contact-select">
          <ul className="contact-list">
            {contacts}
          </ul>
          <div className="buttons col-12">
            <Peerio.UI.Tappable element="div" className="btn-lrg" onTap={this.accept}>OK</Peerio.UI.Tappable>
            <Peerio.UI.Tappable element="div" className="btn-lrg btn-dark" onTap={this.props.onClose}>Cancel</Peerio.UI.Tappable>
          </div>
        </div>
      );
    }
  });

}());