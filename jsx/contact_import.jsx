(function () {
  'use strict';
  Peerio.UI.ContactImport = React.createClass({
    mixins: [ReactRouter.Navigation],
    getInitialState: function(){
      return {searchString: ""};
    },
    search: function(){
      this.transitionTo('contact_import_search', {id:this.state.searchString});
    },
    updateSearchString: function(e){
      this.setState({searchString: e.target.value});
    },
    render: function(){
      return  (<div className="content-padded">
                <h1 className="headline-lrg">Add Contact</h1>
                <p>
                  Enter the username or email of the
                  person you want to add as a contact.
                </p>
                <input type="text" onChange={this.updateSearchString} className="text-input-primary" placeholder="email/username/phone" value={this.state.searchString}/>
                <Peerio.UI.Tappable element="div" className="btn-md" onTap={this.search}>
                  Search
                </Peerio.UI.Tappable>
                <p className="line-across">or</p>
                <p className="centered-text">
                  Import contacts from your phone.
                </p>
                <Peerio.UI.Tappable element="div" className="btn-md" onTap={this.transitionTo.bind(this, "contact_import_search", {id:"stuff"})}>
                  Import
                </Peerio.UI.Tappable>
              </div>);
    }
  });

  Peerio.UI.ContactImportSearch = React.createClass({
    mixins: [ReactRouter.Navigation],
    getInitialState: function(){
      return {searchString: this.props.params.id, selectedUsers:[]};
    },
    selectUser: function(username){
      var selectedIndex = this.state.selectedUsers.indexOf(username);

      if (selectedIndex >= 0){
        this.state.selectedUsers.splice(selectedIndex, 1);
      } else {
        this.state.selectedUsers.push(username);
      }
      this.setState({selectedUsers: this.state.selectedUsers});
    },
    searchForContacts: function(){
      //TODO: search for contacts
      // this is mock contact search
      this.setState({returnData: false});
      var sampleResultData = _.shuffle([
        {fullName:"test One", username:"test_one"}
      ]);
      //no results
      //var sampleResultData = [];

      //mocking results delay
      var self = this;
      setTimeout(function(){
        self.setState({returnData: sampleResultData});
      }, 1000);
    },
    handleAddContact: function(){
      //TODO: loop through results and add selected contacts
      /*this.state.selectedUsers.forEach(function(user){
        Peerio.Contacts.addContact(user);
      });*/
      this.transitionTo('contacts');
    },
    componentDidMount: function(){
      this.searchForContacts(this.state.searchString);
    },
    updateSearchString: function(e){
      this.setState({searchString: e.target.value});
    },
    isValidEmail: function(address){
      var emailRegex = new RegExp(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i);
      return emailRegex.test(address);
    },
    render: function() {

      var self = this;
      var results;
      var inviteButton = false;

      //results found
      if (self.state.returnData && self.state.returnData.length > 0) {

        results = self.state.returnData.map(function(result){
                    var isSelected = self.state.selectedUsers.indexOf(result.username) >= 0;
                    return  <Peerio.UI.Tappable onTap={self.selectUser.bind(self, result.username)} key={result.username}>
                              <ResultTemplate isSelected={isSelected} fullName={result.fullName} username={result.username} />
                            </Peerio.UI.Tappable>;
        });

        inviteButton =  <Peerio.UI.Tappable element="div" className="btn-md btn-safe flex-col-1" onTap={this.handleAddContact}>
                          Invite Selected Contacts
                        </Peerio.UI.Tappable>;

      } else if (self.state.returnData && self.state.returnData.length === 0) {
      //no results found
        ( this.isValidEmail(this.state.searchString) ) ?
          //no results found but search string is email
          results = <div>
                      <p>Sorry, it looks like <strong>{this.state.searchString}</strong> is not signed up for Peerio.</p>
                      <p>Invite them to join Peerio by clicking the button below: </p>
                      <Peerio.UI.Tappable element="div" className="btn-md btn-safe">
                       Send email invite
                      </Peerio.UI.Tappable>
                    </div>
        : results = <p>Sorry, there were no results matching your search. Try searching for contacts again by their email, username or phone number.</p> ;
      } else {
      //loading
        results = <div className="spinner"></div>;
      }

      return (<div className="content-padded flex-col">
                <input type="search flex-col-1" onChange={this.updateSearchString} className="text-input-primary" placeholder="email/username/phone" value={this.state.searchString}/>
                <div className="flex-col-0">
                  <Peerio.UI.Tappable element="div" className="btn-md" onTap={this.searchForContacts}>
                    Search again
                  </Peerio.UI.Tappable>
                </div>
                <div className="list-view flex-col-0" style={{overflowY:'scroll'}}>
                  {results}
                </div>
                <div className="flex-col-0">
                  {inviteButton}
                </div>
      </div>);
    }
  });

  var ResultTemplate = React.createClass({
    render: function(){

      return (<div className={this.props.isSelected ? 'list-item selected' : 'list-item'}>
                <div className="list-item-thumb">
                  <Peerio.UI.Avatar username={Peerio.user.contacts[0].username}/>
                </div>
                <div className="list-item-content">
                  <div className="list-item-title">{this.props.fullName}</div>
                  <div className="list-item-description">{this.props.username}</div>
                </div>
                <div className="list-item-thumb">
                  <span type="checkbox" className={this.props.isSelected ? 'checkbox-input checked' : 'checkbox-input' }></span>
                </div>
              </div>);
    }
  });
}());
