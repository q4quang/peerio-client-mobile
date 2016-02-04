(function () {
    'use strict';

    /**
     * Message list item component
     */
    Peerio.UI.Message = React.createClass({
        mixins: [ReactRouter.Navigation],
        openFileView: function (id) {
            this.transitionTo('file', {id: id});
        },
        render: function () {
            var item = this.props.item;
            var prevMessage = this.props.prevItem;
            var conversation = this.props.itemParentData;
            // will be the same for all ack nodes
            var ack = (<i className="fa fa-thumbs-o-up ack-icon"></i>);

            // figuring out render details
            var sender = Peerio.user.contacts.dict[item.sender];
            // mocking contact for deleted contacts todo: ugly!
            if (!sender) {
                sender = {username: item.sender, fullName: item.sender};
            }

            var isAck = item.body === Peerio.ACK_MSG;
            var isSelf = Peerio.user.username === sender.username;

            var isSameDay = item.moment.isSame(prevMessage.moment, 'day');
            var timestampHTML = ( isSameDay && prevMessage ) ? false
                : <Peerio.UI.ConversationTimestamp timestamp={item.moment}/>;

            // will be undefined or ready to render root element for receipts
            var receipts = isSelf
                ? <Peerio.UI.ConversationReceipt conversation={conversation} seqID={item.seqID}
                                                 timestamp={item.timestamp}/>
                : null;

            var body, thisAck;
            // ack message will have and ack icon and no body
            if (isAck) {
                thisAck = ack;
            } else {
                var filesCount = item.files.length
                    ?
                    <div className="file-list">
                        {item.files.length} {item.files.length > 1 ? 'files' : 'file'} attached.
                        {item.files.map(id=> {
                            var file = Peerio.user.files.dict[id];
                            if (!file) return <div className="file-list-item">deleted</div>;
                            return <Peerio.UI.Tappable onTap={this.openFileView.bind(this, file.shortID)}
                                                       tag="div" className="file-list-item">
                                <i className="fa fa-file-o"></i> {file.name}
                            </Peerio.UI.Tappable>;
                        })}
                    </div>
                    : null;

                body = (
                    <div className="body">{filesCount}
                        <Peerio.UI.Linkify text={item.body} onOpen={Peerio.NativeAPI.openInBrowser}>
                        </Peerio.UI.Linkify>
                    </div>
                );
            }
            var itemClass = classNames({
                'item': true,
                'self': isSelf,
                'ack': isAck
            });

            var avatarHTML = (isSelf) ? false : <Peerio.UI.Avatar username={sender.username}/>;

            return (
                <div className={itemClass} ts={item.timestamp} key={item.id}>
                    {timestampHTML}
                    <div className="head">
                        {thisAck}
                        {avatarHTML}
                        <span className="names">{sender.fullName}</span>
                    </div>
                    {body}
                    {receipts}
                </div>
            );
        }
    });

}());
