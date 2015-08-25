(function () {
  'use strict';

  Peerio.UI.ContactSelect = React.createClass({
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
        if (c.username === Peerio.user.username || c.isRequest) return;
        var checkMark = this.state.selection.indexOf(c.username) >= 0
          ? (<i className="fa fa-check-circle"></i>) : '';

        contacts.push(
          <Peerio.UI.Tappable onTap={this.toggle.bind(this, c.username)} key={c.username}>
            <li className="contact">
              {checkMark}
              <Peerio.UI.Avatar username={c.username}/> {c.fullName}
              <span className="username">({c.username})</span>
            </li>
          </Peerio.UI.Tappable>
        );
      }.bind(this));
      return (
        <div className="modal contact-select">
          <ul className="contact-list">
            {contacts}
          </ul>
          <div className="buttons">
            <button type="button" className="btn-lrg" onTouchStart={this.accept}>OK</button>
            <button type="button" className="btn-lrg btn-dark" onTouchStart={this.props.onClose}>Cancel</button>
          </div>
        </div>
      );
    }
  });

}());