(function () {
    'use strict';

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
                this.setState( { inviteCode: 'n/a' } );
            });
        },


        render: function() {
            return (<div className="content without-tab-bar without-footer flex-col">
                <div className="headline"> Get Free Data</div>
                <div className="section-highlight">
                    {this.state.inviteCode} <Peerio.UI.CopyButton copy={this.state.inviteCode}/> 
                </div>
                <p className="flex-grow-1">Every time one of your contacts signs up for Peerio using your invite code, both of you will receive 250MB of bonus storage. You can earn up to 10GB of free storage this way!</p>

                <div className="buttons">
                    <Peerio.UI.Tappable element="div" className="btn-safe">
                        <i className="material-icons">share</i> Share this code
                    </Peerio.UI.Tappable>
                </div>
            </div>);
        }
    });
})();
