(function () {
    'use strict';

    Peerio.UI.ConversationReceipt = React.createClass({
        getInitialState: function () {
            return {showUsers: false};
        },
        toggle: function () {
            this.setState({showUsers: !this.state.showUsers});
        },
        maxDefaultReceipts: 3,
        render: function () {
            var c = this.props.conversation;
            // participants(current): [username, username]
            // exParticipants: {username: left_ts, username: left_ts}
            // exParticipantsArr: [username, username]
            // readPositions: {username: seqID, username: seqID}

            var currentRecipientCount = c.participants.length;
            var exRecipientCount = c.exParticipantsArr.length;
            var totalRecipientCount = currentRecipientCount + exRecipientCount;

            // not gonna render receipts when there never was anybody else in the conversation
            if (totalRecipientCount === 0) return null;

            // recipients who read this message
            var receipts = [];
            for (var readingUser in c.readPositions) {
                if (readingUser != Peerio.user.username && c.readPositions[readingUser] >= this.props.seqID)
                    receipts.push(readingUser);
            }
            if (receipts.length === 0) return null;

            // who had a chance to read this (participants - exParticipants at the time of this message)
            var possibleRecipients = c.participants.slice();
            for (var leavingUser in c.exParticipants) {
                if (c.exParticipants[leavingUser] > this.props.timestamp)
                    possibleRecipients.push(leavingUser);
            }
            if (possibleRecipients.length === 0) return null;

            // data integrity check
            for (var i = 0; i < receipts.length; i++) {
                if (possibleRecipients.indexOf(receipts[i]) < 0)
                    _.pull(receipts, receipts[i]);
            }


            // read by all when only 1 other participant
            if (possibleRecipients.length === 1) {
                if (receipts.length !== 1) return null;
                return (<div className="receipts">Read <i className="fa fa-check"></i></div>);
            }

            // read by all others when more than 1 participant
            if (possibleRecipients.length === receipts.length) {
                return (<div className="receipts" onTouchEnd={this.toggle}>
                    {this.state.showUsers ? receipts.join(' \u2022\ ') : 'Read by all'} <i className="fa fa-check"></i>
                </div>);
            }

            if (receipts.length <= this.maxDefaultReceipts) {
                // read by no more then maxDefaultReceipts participant when more than maxDefaultReceipts participants exist
                return (<div className="receipts">Read by {receipts.join(' \u2022\ ')} <i className="fa fa-check"></i></div>);
            } else {
                // read by more then maxDefaultReceipts participants
                return (<div className="receipts" onTouchEnd={this.toggle}>
                    { this.state.showUsers ? receipts.join(' \u2022\ ') : 'Read by ' + receipts.length }
                     <i className="fa fa-check"></i>
                </div>);
            }
        }
    });
}());
