(function () {
    'use strict';

    Peerio.UI.ConversationHead = React.createClass({
        mixins: [ReactRouter.Navigation, ReactRouter.State],
        getInitialState: function () {
            return {open: false};
        },
        toggle: function () {
            this.setState({open: !this.state.open});
        },
        openInfo: function () {
            this.transitionTo('conversation_info', {id: this.props.conversation.id});
        },
        render: function () {
            var c = this.props.conversation;
            var counter = c.exParticipantsArr.length
                ? c.participants.length + '/' + (c.participants.length + c.exParticipantsArr.length)
                : c.participants.length;

            var participants = c.participants.map(function (username) {
                return (
                    <div key={username}>
                        <Peerio.UI.Avatar username={username}/>
                        {Peerio.user.contacts.getPropValByKey(username, 'fullNameAndUsername')}
                    </div>
                );
            });
            c.exParticipantsArr.forEach(function (username) {
                participants.push(
                    <div key={username} className='former-participant'>
                        <Peerio.UI.Avatar username={username}/>
                        {Peerio.user.contacts.getPropValByKey(username, 'fullNameAndUsername')}
                    </div>
                );
            });
            return (
                <Peerio.UI.Tappable onTap={this.toggle}>
                    <div id="conversation-head">
                        <div
                            className={'participants' + (this.state.open ? ' open' : '')}>{participants}</div>

                        <div className="counter">
                            <i className="fa fa-users"></i> {counter}
                        </div>
                        <Peerio.UI.Tappable onTap={this.openInfo}>
                            <i className="info fa fa-info-circle"></i>
                        </Peerio.UI.Tappable>

                        <div className="subject">{c.subject}</div>
                    </div>
                </Peerio.UI.Tappable>
            );
        }
    });


}());
