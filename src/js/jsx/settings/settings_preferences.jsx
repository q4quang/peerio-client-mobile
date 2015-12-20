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
                })
                .finally( () => { this.resetSettings(); } );
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
                <div className="content-padded">
                    {/* TODO: add language selection
                        <div className="text-input-group">
                        <label className="info-label col-4">Language:</label>
                        <select className="select-input col-8">
                        <option value="en">English</option>
                        </select>
                        </div>
                        */}
                <div className="info-label">Notifications</div>
                <p className="radio-input-group">
                    <p>You will only get notifications on your primary address (email or phone).</p>
                    <p>
                        <Peerio.UI.Tappable key='notify-new-message' onTap={this.setNotifyNewMessage}>
                            <span className="col-10">
                                Notify me of new messages:</span>
                            <span type="checkbox" className={this.state.notifyNewMessage 
                                ? 'checkbox-input checked': 'checkbox-input'}></span>
                        </Peerio.UI.Tappable>
                    </p>
                    <p>
                        <Peerio.UI.Tappable key='notify-new-contact' onTap={this.setNotifyNewContact}>
                            <span className="col-10">
                                Notify me when I receive a contact request:</span>
                            <span type="checkbox" className={this.state.notifyNewContact 
                                ? 'checkbox-input checked': 'checkbox-input'}></span>
                        </Peerio.UI.Tappable>
                    </p>
                    <p>
                        <Peerio.UI.Tappable key='notify-new-contact-request' onTap={this.setNotifyNewContactRequest}>
                            <span className="col-10">
                                Notify me when invites I send are accepted:</span>
                            <span type="checkbox" className={this.state.notifyContactRequest 
                                ? 'checkbox-input checked': 'checkbox-input'}></span>
                        </Peerio.UI.Tappable>
                    </p>
                </p>

                <div className="info-label">Device PIN</div>
                <div className="text-input-group col-12">
                    <Peerio.UI.Tappable element="div" className="btn-sm" onTap={this.setDevicePin}>Set/remove device PIN</Peerio.UI.Tappable>
                </div>
                <RouteHandler/>
                {/* TODO: two factor authentication */}
                {/*
                    <div>
                    <div className="info-label">Two Factor Authentication (2FA)</div>
                    <p className="info-small col-12"> Paste the following secret key into your authenticator app, then enter the code that appears in the app. </p>
                    <p className="text-lrg text-center"><strong>RRHU WCAZ KGCE 6FRM</strong></p>
                    <input className="text-input text-center" type="text" placeholder="authenticator security code"/>
                    <Peerio.UI.Tappable element="div" className="btn-md">Verify 2FA Security Code</Peerio.UI.Tappable>
                    </div>
                    */}
                </div>
            );
        }
    });

}());
