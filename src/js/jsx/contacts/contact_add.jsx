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
        <div className="btn-disabled"><i className="fa fa-search"></i>  Search</div>
      :<Peerio.UI.Tappable element="div" className="btn-safe" onTap={this.goToSearch}>
      <i className="fa fa-search"></i>  Search
    </Peerio.UI.Tappable>;
    return  (<div className="content-padded without-tab-bar flex-col flex-justify-start">
      <h1 className="headline-lrg">Add Contact</h1>
      <input type="text" onChange={this.updateSearchString} className="text-input-primary" placeholder="Search by username, email or phone" value={this.state.searchString}/>
      {searchButton}
      <p className="line-across">or</p>
      <p className="centered-text">
        Import contacts from your phone.
      </p>
      <Peerio.UI.Tappable element="div" className="btn-primary" onTap={this.transitionTo.bind(this, 'add_contact_import')}>
        <i className="fa fa-mobile"></i>  Import
      </Peerio.UI.Tappable>
    </div>);
  }
});

}());
