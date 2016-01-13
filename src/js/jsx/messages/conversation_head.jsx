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
            this.transitionTo('conversation_info', {id: this.props.conversationID});
        },
        render: function () {
            var counter = this.props.allParticipantsCount - 1;
            if (this.props.activeParticipantsCount !== this.props.allParticipantsCount) {
                counter = this.props.activeParticipantsCount - 1 + '/' + counter;
            }
            return (
                <Peerio.UI.Tappable onTap={this.toggle}>
                <div id="conversation-head">
                <div
                className={'participants' + (this.state.open ? ' open' : '')}>{this.props.participants}</div>

                <div className="counter">
                <i className="fa fa-users"></i> {counter}
                </div>
                <Peerio.UI.Tappable onTap={this.openInfo}>
                <i className="info fa fa-info-circle"></i>
                </Peerio.UI.Tappable>

                <div className="subject">{this.props.subject}</div>
                </div>
                </Peerio.UI.Tappable>
            );
        }
    });


}());
