/**
 * Sidebar menu UI component
 */
(function () {
    'use strict';

    Peerio.UI.SideBar = React.createClass({

        mixins: [ReactRouter.Navigation],
        //--- REACT EVENTS
        getInitialState: function () {
            return {
                open: false,
                newPinCode: '',
                modalID: ''
            };
        },
        componentDidMount: function () {
            Peerio.Dispatcher.onSidebarToggle(this.toggle);
            Peerio.Dispatcher.onHardMenuButton(this.toggle);
            Peerio.Dispatcher.onSettingsUpdated(this.forceUpdate.bind(this, null));
            //sidebar is never unmounted so we don't unsubscribe
        },
        //--- CUSTOM FN
        toggle: function () {
            this.setState({open: !this.state.open});
        },

        toggleAndTransition: function (route) {
            this.toggle();
            this.transitionTo(route);
        },
        //addContactCallback: function(username){
        //  if (!username) return;
        //  Peerio.Contacts.addContact(username);
        //  //TODO: add alert with error success feedback
        //},
        // todo: this is bad. find a way to share this chunk of code with contact list view
        handleAddContact: function () {
            this.toggleAndTransition('add_contact');
        },
        handleNewMessage: function () {
            this.toggleAndTransition('new_message');
        },
        handleUpload: function () {
            this.toggleAndTransition('files');
            Peerio.Action.showFileUpload();
        },
        signOut: function() {
            Peerio.NativeAPI.disablePushNotifications()
                .finally(function() {
                    L.info('reload window');
                    window.location.reload();
                });
        },
        //--- RENDER
        render: function () {
            var className = this.state.open ? 'open' : '';
            var pinNode;
            var twoFactor;
            var user = Peerio.user;
            if (!user || !user.settings) return null;
            var quotaUsed = Peerio.Helpers.formatBytes(user.quota.user);
            var quota = Peerio.Helpers.formatBytes(user.quota.total);
            var quotaPercent = Math.floor(user.quota.user / (user.quota.total / 100));

            pinNode = Peerio.user.PINIsSet ? 'Remove PIN code' : 'Set PIN code';

            twoFactor = user.settings.twoFactorAuth ? 'Disable two factor auth' : 'Enable two factor auth';

            if (Peerio)
                return (
                    <div>
                        <Peerio.UI.Swiper onSwipeLeft={this.toggle} className={className + ' sidebar'}>

                            <div className="flex-0 sidebar-header">
                                <Peerio.UI.Avatar size="big" username={user.username}/>
                                <div className="col-9 col-last">
                                  <h3 className="headline-md">{user.firstName} {user.lastName}</h3>
                                  <span className="subhead-inline">{user.username}</span>
                                </div>
                            </div>

                            <div className="flex-1" ref="menu">
                                {
                                //  <ul className="flex-row">
                                //     <Peerio.UI.Tappable tag='li' onTap={this.handleNewMessage}
                                //                         className="icon-with-label flex-col-1">
                                //         <i className="fa fa-pencil circle"/>
                                //         <span className="icon-label">New Message</span>
                                //     </Peerio.UI.Tappable>
                                //     <Peerio.UI.Tappable tag="li" onTap={this.handleUpload}
                                //                         className="icon-with-label flex-col-1">
                                //         <i className="fa fa-cloud-upload circle"/>
                                //         <span className="icon-label">Upload File</span>
                                //     </Peerio.UI.Tappable>
                                //     <Peerio.UI.Tappable tag="li" onTap={this.handleAddContact}
                                //                         className="icon-with-label flex-col-1">
                                //         <i className="fa fa-user-plus circle"/>
                                //         <span className="icon-label">Add Contact</span>
                                //     </Peerio.UI.Tappable>
                                // </ul>
                                }

                                <h3 className="subhead">Security</h3>
                                <ul>
                                    <Peerio.UI.Tappable tag='li'
                                        onTap={this.toggleAndTransition.bind(this, 'set_pin')}>
                                        <i className="fa fa-lock"/>
                                        <span>{pinNode}</span>
                                    </Peerio.UI.Tappable>
                                    <Peerio.UI.Tappable tag='li'
                                        onTap={this.toggleAndTransition.bind(this, 'settings_2fa')}>
                                        <i className="fa fa-mobile"/>
                                        <span>{twoFactor}</span>
                                    </Peerio.UI.Tappable>
                                </ul>
                                <h3 className="subhead">Account</h3>

                                <ul>
                                     <Peerio.UI.Tappable tag="li"
                                        onTap={this.toggleAndTransition.bind(this, 'account_settings')}>
                                        <i className="fa fa-user"></i> Profile
                                     </Peerio.UI.Tappable>

                                     <Peerio.UI.Tappable tag="li"
                                        onTap={this.toggleAndTransition.bind(this, 'preference_settings')}>
                                        <i className="fa fa-cog"></i> Preferences
                                     </Peerio.UI.Tappable>
                                </ul>
                            </div>

                            <div>
                                <span className="info-label">Storage</span>
                                {quotaUsed} / {quota} ({quotaPercent}%) used
                            </div>

                            <div className="flex-0">
                                <Peerio.UI.Tappable element="div" className="btn-dark btn-md"
                                                    onTap={this.signOut}><i
                                    className="fa fa-power-off"></i> Sign Out
                                </Peerio.UI.Tappable>
                                <div className="sidebar-footer-text">
                                    <div className="app-version">Peerio
                                        version: {Peerio.NativeAPI.getAppVersion()}</div>
                                </div>
                            </div>

                        </Peerio.UI.Swiper>

                        <div id="sidebar-dimmer" ref="dimmer" className={className} onTouchStart={this.toggle}></div>
                    </div>
                );
        }

    });

}());
