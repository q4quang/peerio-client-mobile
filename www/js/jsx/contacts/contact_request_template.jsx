//Each item handles it own 'selected' state individually to avoid looping through
//all contacts on each tap. Contacts are selected by reaching into the parent
//component with a props.onTap function.

(function () {
  'use strict';

Peerio.UI.ContactRequestTemplate = React.createClass({
  getInitialState: function(){
    return {selected: false};
  },
  toggleSelection: function(){
    this.props.onTap(this.props.username);
    this.setState({selected: !this.state.selected});
  },
  render: function(){
    var self = this;
    var name;
    var publicKey = this.props.publicKey;
    if (this.props.name) {
      name = <div className="list-item-title">
                {this.props.name} &bull; <span className="text-mono p-blue-dark-15">{this.props.username}</span>
             </div>;
    } else {
      name = <div className="list-item-title">
                {this.props.username}
                <div className="text-mono p-blue-dark-15">{this.props.publicKey}</div>
              </div>;
    }
    return <Peerio.UI.Tappable element="div" className='list-item' onTap={this.toggleSelection}>
      <div className="list-item-content">
        {name}
      </div>
      <div className="list-item-thumb">
        <span type="checkbox" className={this.state.selected ? 'checkbox-input checked': 'checkbox-input'}></span>
      </div>
    </Peerio.UI.Tappable>;
  }
});


}());