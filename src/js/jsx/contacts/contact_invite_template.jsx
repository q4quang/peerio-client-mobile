//Each item handles it own 'selected' state individually to avoid looping through
//all contacts on each tap. Contacts are selected by reaching into the parent
//component with an onTap function bound to each email address.

(function () {
  'use strict';

Peerio.UI.ContactInviteTemplate = React.createClass({
  getInitialState: function(){
    return {selected: false};
  },
  toggleSelection: function(email){
    email.selected = !email.selected;
    email.onTap(email.value);
    this.forceUpdate();
  },
  render: function(){
    var self = this;
    var emails = _.map(this.props.emails,function(email){
      // onTap={email.tapEvent.bind(self, email.value, contactID)}
      return (<Peerio.UI.Tappable element="div" className="list-item" onTap={self.toggleSelection.bind(self, email)}>
        <div className="list-item-content">{email.value}</div>
        <div className="list-item-thumb">
          <div className={ email.selected ? 'checkbox-input checked': 'checkbox-input'} />
        </div>
      </Peerio.UI.Tappable>);
    });

    var name = this.props.name ? <div className="list-item-title">{this.props.name}</div> : "" ;

    return (
        <div className='list-item'>
          <div className="list-item-content">
            {name}
            <div className="list-item-description">
              <ul className="nested-list">
                {emails}
              </ul>
            </div>
          </div>
        </div>
    );
  }
});

}());