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
            this.state.open ? Peerio.DataCollection.App.closeSideBarNoAction() : Peerio.DataCollection.App.openSideBar();
            this.setState({open: !this.state.open});
        },

        toggleAndTransition: function (route) {
            Peerio.DataCollection.App.closeSideBar();
            this.setState({open: false});
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
        signOut: function () {
            Peerio.NativeAPI.disablePushNotifications()
                .catch(noop)
                .then(Peerio.SqlDB.closeAll)
                .catch(noop)
                .then(()=> window.location.reload());
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

            pinNode = Peerio.user.PINIsSet ? 'Remove passcode' : 'Set passcode';

            twoFactor = user.settings.twoFactorAuth ? 'Disable two factor auth' : 'Enable two factor auth';

            if (Peerio)
                return (
                    <div>
                        <Peerio.UI.Swiper onSwipeLeft={this.toggle} className={className + ' sidebar'}>
                            <ul className="sidebar-header">
                                <li>
                                    <Peerio.UI.Avatar size="big" username={user.username}/>
                                    <div className="text-overflow">
                                        <div className="headline-md">{user.firstName} {user.lastName}</div>
                                        <div className="subhead-inline">{user.username}</div>
                                    </div>
                                </li>
                                <li className="storage-info">
                                    <label>Storage</label>
                                    <div>{quotaUsed} / {quota} ({quotaPercent}%)</div>
                                </li>
                            </ul>

                            <div className="flex-col flex-grow-1 sidebar-menu" ref="menu">
                                <ul>
                                    <Peerio.UI.Tappable tag='li'
                                                        onTap={this.toggleAndTransition.bind(this, 'set_pin')}>
                                        <i className="material-icons">lock</i>
                                        <span>{pinNode}</span>
                                    </Peerio.UI.Tappable>
                                    <Peerio.UI.Tappable tag='li'
                                                        onTap={this.toggleAndTransition.bind(this, 'settings_2fa')}>
                                        <i className="material-icons">smartphone</i>
                                        <span>{twoFactor}</span>
                                    </Peerio.UI.Tappable>

                                    <Peerio.UI.Tappable tag="li"
                                                        onTap={this.toggleAndTransition.bind(this, 'account_settings')}>
                                        <i className="material-icons">person</i> Profile
                                    </Peerio.UI.Tappable>

                                    <Peerio.UI.Tappable tag="li"
                                                        onTap={this.toggleAndTransition.bind(this, 'share_code')}>
                                        <i className="material-icons">share</i> Get Free Data
                                    </Peerio.UI.Tappable>

                                    <Peerio.UI.Tappable tag="li"
                                                        onTap={this.toggleAndTransition.bind(this, 'preference_settings')}>
                                        <i className="material-icons">settings</i> Preferences
                                    </Peerio.UI.Tappable>

                                    <Peerio.UI.Tappable tag="li"
                                                        onTap={this.toggleAndTransition.bind(this, 'enter_coupon')}>
                                        <i className="fa fa-certificate"></i> Redeem Coupon
                                    </Peerio.UI.Tappable>
                                </ul>
                                <div className="flex-grow-1"></div>
                                { /* signout */}
                                <ul>
                                    <Peerio.UI.Tappable element="li"
                                                        onTap={this.signOut}><i
                                        className="material-icons">power_settings_new</i> Sign Out
                                    </Peerio.UI.Tappable>
                                </ul>
                            </div>

                            <div className="app-version">
                                Peerio version: {Peerio.runtime.version}
                            </div>
                        </Peerio.UI.Swiper>

                        <div id="sidebar-dimmer" ref="dimmer" className={className} onTouchStart={this.toggle}></div>
                    </div>
                );
        }

    });

}());
