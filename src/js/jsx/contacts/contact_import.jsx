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
            //mock contacts
            //if (!contacts){
            //  var contacts =  [{"id":1,"rawId":null,"displayName":null,"name":{"givenName":"Kate","formatted":"Kate Bell","middleName":null,"familyName":"Bell","honorificPrefix":null,"honorificSuffix":null},"nickname":null,"phoneNumbers":[{"type":"mobile","value":"(555) 564-8583","id":0,"pref":false},{"type":"other","value":"48-798-609-795","id":1,"pref":false}, {"type":"other","value":"(41)-695****","id":1,"pref":false}],"emails":[{"type":"work","value":"jan.drewniak+peerioD@gmail.com","id":0,"pref":false},{"type":"work","value":"www.icloud.com","id":1,"pref":false}],"addresses":[{"postalCode":"94010","type":"work","id":0,"locality":"Hillsborough","pref":"false","streetAddress":"165 Davis Street","region":"CA","country":null}],"ims":null,"organizations":[{"name":"Creative Consulting","title":"Producer","type":null,"pref":"false","department":null}],"birthday":254145600000,"note":null,"photos":null,"categories":null,"urls":null},{"id":2,"rawId":null,"displayName":null,"name":{"givenName":"Daniel","formatted":"Daniel Higgins Jr.","middleName":null,"familyName":"Higgins","honorificPrefix":null,"honorificSuffix":"Jr."},"nickname":null,"phoneNumbers":[{"type":"home","value":"555-478-7672","id":0,"pref":false},{"type":"mobile","value":"(408) 555-5270","id":1,"pref":false},{"type":"fax","value":"(408) 555-3514","id":2,"pref":false}],"emails":[{"type":"home","value":"jan.drewniak2@.com","id":0,"pref":false}],"addresses":[{"postalCode":"94925","type":"home","id":0,"locality":"Corte Madera","pref":"false","streetAddress":"332 Laguna Street","region":"CA","country":"USA"}],"ims":null,"organizations":null,"birthday":null,"note":"Sister: Emily","photos":null,"categories":null,"urls":null},{"id":3,"rawId":null,"displayName":null,"name":{"givenName":"John","formatted":"John Appleseed","middleName":null,"familyName":"Appleseed","honorificPrefix":null,"honorificSuffix":null},"nickname":null,"phoneNumbers":[{"type":"mobile","value":"888-555-5512","id":0,"pref":false},{"type":"home","value":"888-555-1212","id":1,"pref":false}],"emails":[{"type":"work","value":"jan.drewniak+peerioC@gmail.com","id":0,"pref":false}],"addresses":[{"postalCode":"30303","type":"work","id":0,"locality":"Atlanta","pref":"false","streetAddress":"3494 Kuhl Avenue","region":"GA","country":"USA"},{"postalCode":"30303","type":"home","id":1,"locality":"Atlanta","pref":"false","streetAddress":"1234 Laurel Street","region":"GA","country":"USA"}],"ims":null,"organizations":null,"birthday":330523200000,"note":"College roommate","photos":null,"categories":null,"urls":null},{"id":4,"rawId":null,"displayName":null,"name":{"givenName":"Anna","formatted":"Anna Haro","middleName":null,"familyName":"Haro","honorificPrefix":null,"honorificSuffix":null},"nickname":"Annie","phoneNumbers":[{"type":"home","value":"555-522-8243","id":0,"pref":false}],"emails":[{"type":"home","value":"jan.drewniak@bluestatedigital.com","id":0,"pref":false}, {"type":"home","value":"anna2-haro2@mac.com","id":0,"pref":false}],"addresses":[{"postalCode":"94965","type":"home","id":0,"locality":"Sausalito","pref":"false","streetAddress":"1001  Leavenworth Street","region":"CA","country":"USA"}],"ims":null,"organizations":null,"birthday":494164800000,"note":null,"photos":null,"categories":null,"urls":null},{"id":5,"rawId":null,"displayName":null,"name":{"givenName":"Hank","formatted":"Hank M. Zakroff","middleName":"M.","familyName":"Zakroff","honorificPrefix":null,"honorificSuffix":null},"nickname":null,"phoneNumbers":[{"type":"work","value":"(555) 766-4823","id":0,"pref":false},{"type":"other","value":"(707) 555-1854","id":1,"pref":false}],"emails":[{"type":"work","value":"hank-zakroff@mac.com","id":0,"pref":false}],"addresses":[{"postalCode":"94901","type":"work","id":0,"locality":"San Rafael","pref":"false","streetAddress":"1741 Kearny Street","region":"CA","country":null}],"ims":null,"organizations":[{"name":"Financial Services Inc.","title":"Portfolio Manager","type":null,"pref":"false","department":null}],"birthday":null,"note":null,"photos":null,"categories":null,"urls":null},{"id":6,"rawId":null,"displayName":null,"name":{"givenName":"David","formatted":"David Taylor","middleName":null,"familyName":"Taylor","honorificPrefix":null,"honorificSuffix":null},"nickname":null,"phoneNumbers":[{"type":"home","value":"555-610-6679","id":0,"pref":false}],"emails":null,"addresses":[{"postalCode":"94920","type":"home","id":0,"locality":"Tiburon","pref":"false","streetAddress":"1747 Steuart Street","region":"CA","country":"USA"}],"ims":null,"organizations":null,"birthday":897912000000,"note":"Plays on Cole's Little League Baseball Team\n","photos":null,"categories":null,"urls":null}];
            //}

            contacts = Peerio.Util.filterDeviceContacts(contacts);
            this.searchForPeerioUsers(contacts);

        },
        searchForPeerioUsers: function (contacts) {

            var addressChunks = _.chunk(Peerio.Util.parseAddressesForLookup(contacts), 500);

            var self = this;

            //index contacts by ID to merge with foundUsers.
            contacts = _.indexBy(contacts, 'id');

            addressChunks.forEach(function (addressChunk) {

                var searchAddresses = {addresses: addressChunk};

                Peerio.Net.addressLookup(searchAddresses)
                    .then(function (returnData) {

                        var foundUsers = _.filter(returnData, function (i) {
                            return i.username;
                        });
                        foundUsers = _.indexBy(foundUsers, 'id');

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
                <div className="compact-list-view">
                    {contactRequestList}
                </div>
                <div className="headline-divider">Invite Your Contacts to Peerio</div>
                <div className="flexible-list-view">
                    {contactInviteList}
                </div>
            </div>);
        }
    });

}());
