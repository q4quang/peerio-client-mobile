(function () {

    Peerio.UI.PreferenceSettings = React.createClass({
        getInitialState: function(){
            return {
                user: (Peerio.user.isMe) ? Peerio.user : false,
                newAddressText: '',
                firstName: Peerio.user ? Peerio.user.settings.firstName : '',
                lastName: Peerio.user ? Peerio.user.settings.lastName : '',
                addresses: Peerio.user ? Peerio.user.getAddresses() : ''
            };
        },        
        setDevicePin: function() {
            Peerio.Action.transitionTo('set_pin', null, {});
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
                            <label htmlFor="notify-at-primary-address" className="col-10">
                                Notify me of new messages:</label>
                            <input id="notify-new-message" 
                                type="checkbox" 
                                name="notify-new-message" 
                                className="checkbox-input col-2 text-right"/>
                        </p>
                        <p>
                            <Peerio.UI.Tappable key={f.id} onTap={this.toggle.bind(this,f.id)}>
                                <span className="col-10">
                                    Tell me when I get new contacts:</span>
                                <span type="checkbox" className={this.state.selected 
                                    ? 'checkbox-input checked': 'checkbox-input'}></span>
                            </Peerio.UI.Tappable>
                        </p>
                        <p>
                            <label htmlFor="notify-contact-request" className="col-10">
                                Inform me when I get contact requests:</label>
                            <input id="notify-contact-request" 
                                type="checkbox" 
                                name="notify-at-primary-address" 
                                className="checkbox-input col-2 text-right"/>
                        </p>
                    </p>

                    <div className="info-label">Device PIN</div>
                    <div className="text-input-group col-12">
                        <Peerio.UI.Tappable element="div" className="btn-sm" onTap={this.setDevicePin}>Set/remove device PIN</Peerio.UI.Tappable>
                    </div>
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
    })

}());