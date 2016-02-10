(function () {
    'use strict';

    Peerio.UI.AddContactImport = React.createClass({
        mixins: [ReactRouter.Navigation],
        getInitialState: function () {
            return {deviceContacts: [], availableContacts: []};
        },
        //contacts marked as selected are handled outside React state because updating
        //through state would force a loop through all availableContacts on render as well (too expensive).
        inviteAddresses: [],
        requestContacts: [],
        componentWillMount: function () {
            this.subscriptions = [Peerio.Dispatcher.onBigGreenButton(this.addOrInviteContacts)];
        },
        componentWillUnmount: function () {
            Peerio.Dispatcher.unsubscribe(this.subscriptions);
        },
        componentDidMount: function () {
            if (navigator.contacts) {

                var options = new ContactFindOptions();
                options.multiple = true;
                options.desiredFields = [navigator.contacts.fieldType.name, navigator.contacts.fieldType.emails, navigator.contacts.fieldType.phoneNumbers];

                var requiredFields = [navigator.contacts.fieldType.emails, navigator.contacts.fieldType.phoneNumbers];
                var deviceImportSuccess = this.deviceImportSuccess;
                var deviceImportFailure = this.deviceImportFailure;
                navigator.contacts.find(requiredFields, deviceImportSuccess, deviceImportFailure, options);

            } else {
                //dev mode
                this.deviceImportSuccess();
            }
        },
        deviceImportFailure: function () {
            Peerio.Action.showAlert({text: 'Please enable Peerio to access your device contacts to use the contact import feature.'});
        },
        deviceImportSuccess: function (contacts) {
            contacts = Peerio.Util.filterDeviceContacts(contacts);
            this.searchForPeerioUsers(contacts);

        },
        searchForPeerioUsers: function (contacts) {

            var addressChunks = _.chunk(Peerio.Util.parseAddressesForLookup(contacts), 500);

            var self = this;

            //index contacts by ID to merge with foundUsers.
            contacts = _.keyBy(contacts, 'id');

            addressChunks.forEach(function (addressChunk) {

                var searchAddresses = {addresses: addressChunk};

                Peerio.Net.addressLookup(searchAddresses)
                    .then(function (returnData) {

                        var foundUsers = _.filter(returnData, function (i) {
                            return i.username;
                        });
                        foundUsers = _.keyBy(foundUsers, 'id');

                        if (self.state.availableContacts.length) {
                            contacts = _.merge(self.state.availableContacts, foundUsers);
                        } else {
                            contacts = _.merge(contacts, foundUsers);
                        }

                        self.setState({availableContacts: contacts});
                    });
            });
        },
        handleInviteAddress: function (address) {
            var adrObj = {email: address};

            if (!_.some(this.inviteAddresses, adrObj)) {
                this.inviteAddresses.push(adrObj);
            } else {
                _.remove(this.inviteAddresses, adrObj);
            }
        },
        handleRequestContact: function (username) {
            var usrObj = {username: username};

            if (!_.some(this.requestContacts, usrObj)) {
                this.requestContacts.push(usrObj);
            } else {
                _.remove(this.requestContacts, usrObj);
            }
        },
        addOrInviteContacts: function () {

            if (this.inviteAddresses.length === 0 && this.requestContacts.length === 0) {
                return;
            }

            var usersToAddInvite = {};

            if (this.requestContacts.length !== 0) {
                usersToAddInvite.add = this.requestContacts;
            }

            if (this.inviteAddresses.length !== 0) {
                usersToAddInvite.invite = this.inviteAddresses;
            }
            Peerio.Net.addOrInviteContacts(usersToAddInvite)
                .bind(this)
                .then(function (a) {
                    this.transitionTo('contacts');
                });
        },
        render: function () {

            var contactRequestList = [];
            var contactInviteList = [];

            var inviteAddress = this.handleInviteAddress;
            var requestContact = this.handleRequestContact;

            _.forOwn(this.state.availableContacts, function (contact, contactID) {
                if (contact.username) {
                    contactRequestList.push(
                        <Peerio.UI.ContactRequestTemplate
                            name={contact.name}
                            username={contact.username}
                            id={contactID}
                            onTap={requestContact}
                            isSelected={contact.selected}/>
                    );
                } else if (contact.emails.length) {

                    _.each(contact.emails, function (email) {
                        email.onTap = inviteAddress;
                    });
                    contactInviteList.push(
                        <Peerio.UI.ContactInviteTemplate name={contact.name} emails={contact.emails} id={contactID}/>
                    );
                }

            });

            if (this.state.availableContacts.length === 0) {
                return (
                    <div className="content without-tab-bar">
                        <div className="headline">Contact Import</div>
                        <div className="peerio-loader"></div>
                    </div>);
            }

            return (<div className="content without-tab-bar">
                <div className="headline">Contact Import</div>
                <div className="headline-divider">Your Friends on Peerio</div>
                <ul>
                    {contactRequestList}
                </ul>
                <div className="headline-divider">Invite Your Contacts to Peerio</div>
                <ul className="flex-list">
                    {contactInviteList}
                </ul>
            </div>);
        }
    });

}());
