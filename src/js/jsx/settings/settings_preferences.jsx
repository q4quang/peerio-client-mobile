(function () {

    Peerio.UI.PreferenceSettings = React.createClass({
        mixins: [ReactRouter.Navigation],

        getInitialState: function(){
            return this.getSettings();
        },

        componentDidMount: function () {
            this.subscriptions = [
                Peerio.Dispatcher.onSettingsUpdated( this.resetSettings.bind(this) ),
                Peerio.Dispatcher.onTwoFactorAuthReject( this.resetSettings.bind(this) ),
                Peerio.Dispatcher.onTwoFactorAuthRequested(this.handle2FA),
                Peerio.Dispatcher.onTwoFactorAuthResend(this.handle2FAResend)
            ];
        },

        componentWillUnmount: function () {
            Peerio.Dispatcher.unsubscribe(this.subscriptions);
        },

        resetSettings: function() {
            this.setState(this.getSettings());
        },

        getSettings: function() {
            return {
                notifyNewContact: Peerio.user.settings.receiveContactNotifications,
                notifyNewMessage: Peerio.user.settings.receiveMessageNotifications,
                notifyContactRequest: Peerio.user.settings.receiveContactRequestNotifications
            };
        },

        handle2FA: function(resolve, reject) {
            this.resolve2FA = resolve;
            this.reject2FA = reject;
            L.info('2fa requested');
            this.transitionTo('preference_settings_2fa_prompt');
        },

        handle2FAResend: function() {
            L.info('2fa resend requested');
            this.resolve2FA('succesfully entered 2fa code');
        },

        setDevicePin: function() {
            Peerio.Action.transitionTo('set_pin', null, {});
        },
        doUpdateNotificationSettings: function(){
            this.doUpdate = this.doUpdate || _.throttle(function(){
                return Peerio.user.setNotifications(
                    this.state.notifyNewMessage,
                    this.state.notifyNewContact,
                    this.state.notifyContactRequest)
                .catch( (error) => {
                    Peerio.Action.showAlert({text: 'Save failed. ' + (error ? (' Error message: ' + error.message) : '')});
                    this.resetSettings();
                });
            }, 1000);
            this.doUpdate();
        },
        setNotifyNewContact: function() {
            this.setState({notifyNewContact: !this.state.notifyNewContact});
            this.doUpdateNotificationSettings();
        },
        setNotifyNewMessage: function() {
            this.setState({notifyNewMessage: !this.state.notifyNewMessage});
            this.doUpdateNotificationSettings();
        },
        setNotifyNewContactRequest: function() {
            this.setState({notifyContactRequest: !this.state.notifyContactRequest});
            this.doUpdateNotificationSettings();
        },
        render: function(){
            return (
                <div className="content without-tab-bar">
                    <div className="subhead">Notifications</div>
                    <ul>
                        <Peerio.UI.Tappable key='notify-new-message'
                                            element="li"
                                            className="flex-row"
                                            onTap={this.setNotifyNewMessage}>
                            <div type="checkbox" className={this.state.notifyNewMessage
                                ? 'checkbox-input checked': 'checkbox-input'}></div>
                              <div>You receive a new message</div>
                        </Peerio.UI.Tappable>

                        <Peerio.UI.Tappable key='notify-new-contact'
                                            element="li"
                                            className="flex-row"
                                            onTap={this.setNotifyNewContact}>
                            <div type="checkbox" className={this.state.notifyNewContact
                                ? 'checkbox-input checked': 'checkbox-input'}></div>
                              <div>You receive a contact request</div>
                        </Peerio.UI.Tappable>

                        <Peerio.UI.Tappable key='notify-new-contact-request'
                                            element="li"
                                            className="flex-row"
                                            onTap={this.setNotifyNewContactRequest}>
                            <div type="checkbox" className={this.state.notifyContactRequest
                                ? 'checkbox-input checked': 'checkbox-input'}></div>
                              <div>Your invite is accepted</div>
                        </Peerio.UI.Tappable>

                        <li className="caption" style={{height:'64px'}}>You will only recieve notifications on your primary address (email or phone).</li>
                    </ul>
                    <div className="subhead">Touch ID</div>
                    <Peerio.UI.TouchId/>
                    <RouteHandler/>
                </div>
            );
        }
    });

}());
