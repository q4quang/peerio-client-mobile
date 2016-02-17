(function () {
    'use strict';

    var shareText = 'Securely share messages and files with me on Peerio! Use code {0} to add me and get 250MB of bonus storage.';
    var shareSubject = 'Peerio';
    var shareLink = 'http://www.peerio.com/';

    Peerio.UI.ShareCode = React.createClass({
        mixins:[ReactRouter.Navigation],

        getInitialState: function() {
            return { inviteCode: null };
        },

        componentWillMount: function() {
            Peerio.user.getInviteCode()
            .then( (code) => {
                code && code.inviteCode && this.setState( { inviteCode: code.inviteCode } );
            })
            .catch( () => {
                this.setState( { inviteCode: null } );
            });
        },

        invokeShare: function() {
            this.state.inviteCode && this.state.inviteCode.length && 
            Peerio.NativeAPI.shareNativeDialog(
                Peerio.Util.interpolate(shareText, [this.state.inviteCode]),
                shareSubject,
                Peerio.Util.interpolate(shareLink, [this.state.inviteCode])
            );
        },

        render: function() {
            return (<div className="content without-tab-bar without-footer flex-col">
                <div className="headline"> Get Free Data</div>
                <div className="section-highlight">
                    {this.state.inviteCode} <Peerio.UI.CopyButton copy={this.state.inviteCode}/> 
                </div>
                <p className="flex-grow-1">When one of your contacts signs up for Peerio and enters your promo code, a contact request will automatically be sent to them from your account and both of you will receive 250MB of bonus storage. You can earn up to 10GB of free storage this way!</p>

                <div className="buttons">
                    <Peerio.UI.Tappable element="div" className="btn-safe" onTap={this.invokeShare}>
                        <i className="material-icons">share</i> Share this code
                    </Peerio.UI.Tappable>
                </div>
            </div>);
        }
    });
})();
