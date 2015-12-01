(function () {
  'use strict';

Peerio.UI.AddContact = React.createClass({
  mixins: [ReactRouter.Navigation],
  getInitialState: function(){
    return {searchString: ''};
  },
  goToSearch: function(){
    this.transitionTo('add_contact_search', {id:this.state.searchString});
  },
  updateSearchString: function(e){
    this.setState({searchString: e.target.value});
  },
  render: function(){
    var searchButton = (this.state.searchString.length === 0) ?
        <div className="btn-md btn-disabled"><i className="fa fa-search"></i>&nbsp; Search</div>
        :<Peerio.UI.Tappable element="div" className="btn-md btn-safe" onTap={this.goToSearch}>
      <i className="fa fa-search"></i>&nbsp; Search
    </Peerio.UI.Tappable>;
    return  (<div className="content-padded without-tab-bar">
      <h1 className="headline-lrg">Add Contact</h1>
      <input type="text" onChange={this.updateSearchString} className="text-input-primary" placeholder="Search by email or phone" value={this.state.searchString}/>
      {searchButton}
      <p className="line-across">or</p>
      <p className="centered-text">
        Import contacts from your phone.
      </p>
      <Peerio.UI.Tappable element="div" className="btn-md" onTap={this.transitionTo.bind(this, 'add_contact_import')}>
        <i className="fa fa-mobile"></i>&nbsp; Import
      </Peerio.UI.Tappable>
    </div>);
  }
});

}());