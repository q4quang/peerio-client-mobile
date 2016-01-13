(function () {
    'use strict';

    Peerio.UI.AddContactSearch = React.createClass({
        mixins: [ReactRouter.Navigation],
        getInitialState: function () {
            return {searchString: this.props.params.id, searchResults: false};
        },
        selectedUsers: [],
        componentWillMount: function () {
            this.subscriptions = [Peerio.Dispatcher.onBigGreenButton(this.handleAddContact)];
        },
        componentDidMount: function () {
            this.handleSearchForContacts();
        },
        componentWillUnmount: function () {
            Peerio.Dispatcher.unsubscribe(this.subscriptions);
        },
        selectUserToAdd: function (username) {
            if (this.selectedUsers.indexOf(username) === -1) {
                this.selectedUsers.push(username);
            } else {
                this.selectedUsers.splice(username, 1);
            }
        },
        handleSearchForContacts: function () {
            //reset state on new search
            var searchString = React.findDOMNode(this.refs.searchInput).value || this.state.searchString;
            this.selectedUsers = [];
            this.setState({
                searchResults: false,
                parsedSearchString: Peerio.Util.parseAddress(searchString),
                searchString: searchString
            }, this.searchForContacts);
        },
        searchForContacts: function () {
            //search by email or phone
            if (this.state.parsedSearchString) {
                var query = {id: 'search-query'};
                query[this.state.parsedSearchString.type] = this.state.parsedSearchString.value;
                Peerio.Net.addressLookup({addresses: [query]})
                    .bind(this)
                    .then(function (results) {
                        //assuming only one result based on exact address match.
                        this.setState({searchResults: results[0]});
                    })
                    .catch(function (e) {
                        this.setState({searchResults: []});
                    });
            } else {
                //search by username
                Peerio.Net.getPublicKey(this.state.searchString)
                    .bind(this)
                    .then(function (results) {
                        this.setState({searchResults: results});
                    })
                    .catch(function (e) {
                        this.setState({searchResults: []});
                    });
            }
        },
        inviteByEmail: function () {
            Peerio.Net.inviteUserAddress(this.state.searchString);
            Peerio.Action.showAlert({text: 'We\'ve sent an invite email to ' + this.state.searchString});
        },
        handleAddContact: function () {
            if (this.selectedUsers.length === 0) {
                return;
            }
            _.each(this.selectedUsers, function (username) {
                // TODO: this should be added to local contact list until server response
                Peerio.Contact(username).add();
            });

            this.transitionTo('contacts');
        },
        render: function () {

            var self = this;

            var resultNode = <div className="spinner"></div>;
            var searchResults = this.state.searchResults;
            var searchString = this.state.parsedSearchString;

            if (searchResults === false) {
                resultNode = <div className="spinner"></div>;
            } else if (searchResults.username) { //assuming single search result
                resultNode = <Peerio.UI.ContactRequestTemplate username={this.state.searchResults.username}
                                                               onTap={this.selectUserToAdd}
                                                               id={this.state.searchResults.id}
                                                               key={this.state.searchResults.id}/>;
            } else if (searchString && searchString.type === 'email') {
                resultNode = <div>
                    <p>Sorry, it looks like <strong>{this.state.searchString}</strong> is not signed up for Peerio.</p>

                    <p>Invite them to join Peerio by clicking the button below: </p>
                    <Peerio.UI.Tappable element="div" className="btn-md btn-safe" onTap={this.inviteByEmail}>
                        Send email invite
                    </Peerio.UI.Tappable>
                </div>;
            } else {
                resultNode =
                    <p>Sorry, there were no results matching your search. Try searching for contacts again by their
                        email, username or phone number.</p>;
            }

            return (
                <div className="content-padded without-tab-bar">
                    <div className="flex-col flex-justify-start">

                    <h1 className="headline-lrg">Contact Search</h1>
                    <div className="input-group">
                      // NOTE: maybe clear the search on a null return - paul
                        <input type="search" placeholder="email/username/phone" ref="searchInput"/>
                    </div>
                    <Peerio.UI.Tappable element="div" className="btn-safe" onTap={this.handleSearchForContacts}>
                        <i className="fa fa-search"></i> Search again
                    </Peerio.UI.Tappable>
                    <div className="list-view">
                        {resultNode}
                    </div>
                </div>
              </div>);
        }
    });

}());
