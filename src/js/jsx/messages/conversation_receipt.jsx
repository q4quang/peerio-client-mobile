(function () {
    'use strict';

    Peerio.UI.ConversationReceipt = React.createClass({
        getInitialState: function () {
            return {showUsers: false};
        },
        toggle: function () {
            this.setState({showUsers: !this.state.showUsers});
        },
        render: function () {
            var participants = this.props.participants;
            var receipts = this.props.receipts;

            /*read by all others when only 1 other participant */
            if (participants.length - 1 <= 1 && receipts.length == participants.length - 1)
                receipts = (
                    <div className="receipts">Read &nbsp;
                <i className="fa fa-check"></i>
                </div>);

                /*read by all others when more than 1 participant */
                else if (receipts.length == participants.length - 1 /*read by all others - self */)
                    receipts = (
                        <div className="receipts"
                    onTouchEnd={this.toggle}>{this.state.showUsers ? receipts.join(' \u2022\ ') : 'Read by  all'}&nbsp;
                    <i className="fa fa-check"></i>
                    </div>);

                    /*read by 1 participant when more than 1 participants */
                    else if (receipts.length === 1 /*seen by one*/)
                        receipts = (
                            <div className="receipts">Read by {receipts}&nbsp;
                        <i className="fa fa-check"></i>
                        </div>);

                        /*read by some participant */
                        else if (receipts.length)
                            receipts = (
                                <div className="receipts"
                            onTouchEnd={this.toggle}>{ this.state.showUsers ? receipts.join(' \u2022\ ') : 'Read by ' + receipts.length }&nbsp;
                            <i className="fa fa-check"></i>
                            </div>);

                            else
                                receipts = null;


                            return receipts;
        }
    });


}());
