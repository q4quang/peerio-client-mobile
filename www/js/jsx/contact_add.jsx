(function () {
  'use strict';
  Peerio.UI.AddContact = React.createClass({
    mixins: [ReactRouter.Navigation],
    getInitialState: function(){
      return {searchString: ""};
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
      return  (<div className="content-padded">
                <h1 className="headline-lrg">Add Contact</h1>
                <p>
                  Enter the username or email of the
                  person you want to add as a contact.
                </p>
                <input type="text" onChange={this.updateSearchString} className="text-input-primary" placeholder="email/username/phone" value={this.state.searchString}/>
                {searchButton}
                <p className="line-across">or</p>
                <p className="centered-text">
                  Import contacts from your phone.
                </p>
                <Peerio.UI.Tappable element="div" className="btn-md" onTap={this.transitionTo.bind(this ,'add_contact_import')}>
                  <i className="fa fa-mobile"></i>&nbsp; Import
                </Peerio.UI.Tappable>
              </div>);
    }
  });

  Peerio.UI.AddContactSearch = React.createClass({
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
      // this is mock contact search results
      this.setState({returnData: false});
      var sampleResultData = _.shuffle([
        {fullName:"test One", username:"test_one"},
        {fullName:"test Two", username:"test_two"},
        {fullName:"test Three", username:"test_three"},
        {fullName:"test Four", username:"test_four"},
        {fullName:"test Five", username:"test_five"},
        {fullName:"test Six", username:"test_six"}
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
                    var avatar = <Peerio.UI.Avatar username={Peerio.user.contacts[0].username}/>;
                    return  <Peerio.UI.Tappable onTap={self.selectUser.bind(self, result.username)} key={result.username}>
                              <ResultTemplate isSelected={isSelected} title={result.fullName} description={result.username} avatar={avatar} />
                            </Peerio.UI.Tappable>;
        });

        inviteButton =  <Peerio.UI.Tappable element="div" className="btn-md btn-safe flex-col-1" onTap={this.handleAddContact}>
                          Add Selected Contacts
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

  Peerio.UI.AddContactImport = React.createClass({
    getInitialState: function(){
      return {deviceContacts:[],  selectedUsers:[]};
    },
    componentDidMount: function(){
      if (navigator.contacts) {
        var deviceImportSuccess = this.deviceImportSuccess;
        var deviceImportFailure = this.deviceImportFailure;

        var returnFields = [navigator.contacts.fieldType.displayName,
          navigator.contacts.fieldType.emails,
          navigator.contacts.fieldType.phoneNumbers];
        navigator.contacts.find(returnFields, deviceImportSuccess, deviceImportFailure);
      } else {
        this.deviceImportSuccess();
      }
    },
    deviceImportSuccess: function(contacts){
      //mock contacts
      if (!contacts){
        var contacts =  [{"id":1,"rawId":null,"displayName":null,"name":{"givenName":"Kate","formatted":"Kate Bell","middleName":null,"familyName":"Bell","honorificPrefix":null,"honorificSuffix":null},"nickname":null,"phoneNumbers":[{"type":"mobile","value":"(555) 564-8583","id":0,"pref":false},{"type":"other","value":"(415) 555-3695","id":1,"pref":false}],"emails":[{"type":"work","value":"kate-bell@mac.com","id":0,"pref":false},{"type":"work","value":"www.icloud.com","id":1,"pref":false}],"addresses":[{"postalCode":"94010","type":"work","id":0,"locality":"Hillsborough","pref":"false","streetAddress":"165 Davis Street","region":"CA","country":null}],"ims":null,"organizations":[{"name":"Creative Consulting","title":"Producer","type":null,"pref":"false","department":null}],"birthday":254145600000,"note":null,"photos":null,"categories":null,"urls":null},{"id":2,"rawId":null,"displayName":null,"name":{"givenName":"Daniel","formatted":"Daniel Higgins Jr.","middleName":null,"familyName":"Higgins","honorificPrefix":null,"honorificSuffix":"Jr."},"nickname":null,"phoneNumbers":[{"type":"home","value":"555-478-7672","id":0,"pref":false},{"type":"mobile","value":"(408) 555-5270","id":1,"pref":false},{"type":"fax","value":"(408) 555-3514","id":2,"pref":false}],"emails":[{"type":"home","value":"d-higgins@mac.com","id":0,"pref":false}],"addresses":[{"postalCode":"94925","type":"home","id":0,"locality":"Corte Madera","pref":"false","streetAddress":"332 Laguna Street","region":"CA","country":"USA"}],"ims":null,"organizations":null,"birthday":null,"note":"Sister: Emily","photos":null,"categories":null,"urls":null},{"id":3,"rawId":null,"displayName":null,"name":{"givenName":"John","formatted":"John Appleseed","middleName":null,"familyName":"Appleseed","honorificPrefix":null,"honorificSuffix":null},"nickname":null,"phoneNumbers":[{"type":"mobile","value":"888-555-5512","id":0,"pref":false},{"type":"home","value":"888-555-1212","id":1,"pref":false}],"emails":[{"type":"work","value":"John-Appleseed@mac.com","id":0,"pref":false}],"addresses":[{"postalCode":"30303","type":"work","id":0,"locality":"Atlanta","pref":"false","streetAddress":"3494 Kuhl Avenue","region":"GA","country":"USA"},{"postalCode":"30303","type":"home","id":1,"locality":"Atlanta","pref":"false","streetAddress":"1234 Laurel Street","region":"GA","country":"USA"}],"ims":null,"organizations":null,"birthday":330523200000,"note":"College roommate","photos":null,"categories":null,"urls":null},{"id":4,"rawId":null,"displayName":null,"name":{"givenName":"Anna","formatted":"Anna Haro","middleName":null,"familyName":"Haro","honorificPrefix":null,"honorificSuffix":null},"nickname":"Annie","phoneNumbers":[{"type":"home","value":"555-522-8243","id":0,"pref":false}],"emails":[{"type":"home","value":"anna-haro@mac.com","id":0,"pref":false}],"addresses":[{"postalCode":"94965","type":"home","id":0,"locality":"Sausalito","pref":"false","streetAddress":"1001  Leavenworth Street","region":"CA","country":"USA"}],"ims":null,"organizations":null,"birthday":494164800000,"note":null,"photos":null,"categories":null,"urls":null},{"id":5,"rawId":null,"displayName":null,"name":{"givenName":"Hank","formatted":"Hank M. Zakroff","middleName":"M.","familyName":"Zakroff","honorificPrefix":null,"honorificSuffix":null},"nickname":null,"phoneNumbers":[{"type":"work","value":"(555) 766-4823","id":0,"pref":false},{"type":"other","value":"(707) 555-1854","id":1,"pref":false}],"emails":[{"type":"work","value":"hank-zakroff@mac.com","id":0,"pref":false}],"addresses":[{"postalCode":"94901","type":"work","id":0,"locality":"San Rafael","pref":"false","streetAddress":"1741 Kearny Street","region":"CA","country":null}],"ims":null,"organizations":[{"name":"Financial Services Inc.","title":"Portfolio Manager","type":null,"pref":"false","department":null}],"birthday":null,"note":null,"photos":null,"categories":null,"urls":null},{"id":6,"rawId":null,"displayName":null,"name":{"givenName":"David","formatted":"David Taylor","middleName":null,"familyName":"Taylor","honorificPrefix":null,"honorificSuffix":null},"nickname":null,"phoneNumbers":[{"type":"home","value":"555-610-6679","id":0,"pref":false}],"emails":null,"addresses":[{"postalCode":"94920","type":"home","id":0,"locality":"Tiburon","pref":"false","streetAddress":"1747 Steuart Street","region":"CA","country":"USA"}],"ims":null,"organizations":null,"birthday":897912000000,"note":"Plays on Cole's Little League Baseball Team\n","photos":null,"categories":null,"urls":null}];
      }
      var sortedByEmail = {};
      _.each(contacts, function(contact){
        _.each(contact.emails, function(email){
          sortedByEmail[email.value] = contact;
        });
      });

      var deviceContacts = this.searchForPeerioUsers(sortedByEmail);

      this.setState({deviceContacts: deviceContacts, sortedByEmailContacts: sortedByEmail});
    },
    searchForPeerioUsers: function(contacts){
      //TODO: implement actual search to determine which contact is a peerio user.
      _.each(contacts, function(contact){
        var isPeerioUser = _.random(-1,1) > 0;
        if (isPeerioUser) {
          contact.username = "Peerio_user";
          contact.avatar = <Peerio.UI.Avatar username={Peerio.user.contacts[0].username}/>;
          contact.name.formatted = contact.name.formatted + " ("+ contact.name.givenName+")";
        }
      });
      return contacts;
    },
    deviceImportFailure: function(){
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
    render: function(){
      var results = [];
      var self = this;
      _.forOwn(this.state.sortedByEmailContacts, function(contact, email){
        var isSelected = self.state.selectedUsers.indexOf(contact.username) >= 0 ||  self.state.selectedUsers.indexOf(email) >= 0;
        results.push(
            <Peerio.UI.Tappable onTap={self.selectUser.bind(self, contact.username || email)} key={contact.username || email}>
              <ResultTemplate isSelected={isSelected} title={contact.name.formatted} description={email} avatar={contact.avatar} />
            </Peerio.UI.Tappable>);
      });
      return  <div className="content-padded without-tab-bar flex-col">
                <h1 className="headline-lrg">Contact Import</h1>
                <p>Select the contacts you wish to import. Contacts who have a Peerio account will be sent a contact request.</p>
                <p>Contacts who don't have a Peerio will be sent an invitation email instead.</p>
                <div className="list-view flex-col-0" style={{overflowY:'scroll'}}>
                  {results}
                </div>
                <div className="flex-col-0">
                  <Peerio.UI.Tappable element="div" className="btn-md btn-safe flex-col-1">
                    Add Selected Contacts
                  </Peerio.UI.Tappable>
                </div>
              </div>;
    }
  });

  var ResultTemplate = React.createClass({
    render: function(){

      return (<div className={this.props.isSelected ? 'list-item selected' : 'list-item'}>
        <div className="list-item-thumb">
          {this.props.avatar}
        </div>
        <div className="list-item-content">
          <div className="list-item-title">{this.props.title}</div>
          <div className="list-item-description">{this.props.description}</div>
        </div>
        <div className="list-item-thumb">
          <span type="checkbox" className={this.props.isSelected ? 'checkbox-input checked' : 'checkbox-input' }></span>
        </div>
      </div>);
    }
  });

}());
