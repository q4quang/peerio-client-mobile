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
            var participantsLength = c.participants.length;
            var counter = c.exParticipantsArr.length
                ? participantsLength + '/' + (participantsLength + c.exParticipantsArr.length)
                : participantsLength;

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
                    <div className={'participants' + (this.state.open ? ' open' : '')}>
                      {participants}
                    </div>

                    <div className="conversation-info">
                      <div className="subject">{c.subject}</div>
                      <div className="counter">
                            <i className="material-icons">people</i> {counter}
                        </div>
                        <Peerio.UI.Tappable onTap={this.openInfo} className="info">
                            <i className="material-icons">info_outline</i>
                        </Peerio.UI.Tappable>

                      </div>
                    </div>
                </Peerio.UI.Tappable>
            );
        }
    });


}());
