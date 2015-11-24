(function () {

    Peerio.UI.PreferenceSettings = React.createClass({
        render: function(){
            return (
                <div className="content-padded">
                    <div className="text-input-group">
                        <label className="info-label col-4">Language:</label>
                        <select className="select-input col-8">
                            <option value="en">English</option>
                        </select>
                    </div>

                    <div className="info-label">Notifications</div>
                    <p className="radio-input-group">
                        <label htmlFor="notify-at-primary-address" className="col-10 info-small">Notify me of new messages at my primary address:</label>
                        <input id="notify-at-primary-address" type="checkbox" name="notify-at-primary-address" className="checkbox-input col-2 text-right"/>
                    </p>

                    <div className="info-label">Device PIN</div>
                    <div className="text-input-group col-12">
                        <input className="text-input text-center" type="text" required="required" placeholder="Enter a device PIN"/>
                        <Peerio.UI.Tappable element="div" className="btn-sm">create device PIN</Peerio.UI.Tappable>
                    </div>

                    <div>
                        <div className="info-label">Two Factor Authentication (2FA)</div>
                        <p className="info-small col-12"> Paste the following secret key into your authenticator app, then enter the code that appears in the app. </p>
                        <p className="text-lrg text-center"><strong>RRHU WCAZ KGCE 6FRM</strong></p>
                        <input className="text-input text-center" type="text" placeholder="authenticator security code"/>
                        <Peerio.UI.Tappable element="div" className="btn-md">Verify 2FA Security Code</Peerio.UI.Tappable>
                    </div>

                </div>
            );
        }
    })

}());