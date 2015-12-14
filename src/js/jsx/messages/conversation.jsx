(function () {
    'use strict';

    // Main component, entry point for React app
    Peerio.UI.Conversation = React.createClass({
        mixins: [ReactRouter.Navigation, ReactRouter.State],
        //----- REACT EVENTS
        getInitialState: function () {
            return {
                // unsent attachments to the message that will be sent next, if user taps "send"
                attachments: [],
                conversation: null
            };
        },
        componentWillMount: function () {
            Peerio.Messages.getConversation(this.props.params.id)
                .then(c =>this.setState({conversation: c}));
        },
        componentDidMount: function () {

            // Peerio.Messages.markAsRead(this.state.conversation);

            this.subscriptions = [

                Peerio.Dispatcher.onMessageAdded(function (conversationID) {
                    if (this.props.params.id === conversationID) {
                        this.forceUpdate();
                        // Peerio.Messages.markAsRead(this.state.conversation);
                    }
                }.bind(this)),

                Peerio.Dispatcher.onReceiptAdded(function (conversationID) {
                    if (this.props.params.id === conversationID) {
                        this.forceUpdate();
                        //Peerio.Messages.markAsRead(this.state.conversation);
                    }
                }.bind(this)),

                Peerio.Dispatcher.onBigGreenButton(this.sendMessage),
                Peerio.Dispatcher.onFilesSelected(this.acceptFileSelection)

            ];

            // to update relative timestamps
            this.renderInterval = window.setInterval(this.forceUpdate.bind(this), 20000);

            this.disableIfLastParticipant();
        },
        componentWillUnmount: function () {
            window.clearInterval(this.renderInterval);
            Peerio.Dispatcher.unsubscribe(this.subscriptions);
        },
        componentDidUpdate: function () {
            this.scrollToBottom();
        },
        //----- CUSTOM FN
        openFileSelect: function () {
            Peerio.Action.showFileSelect({preselected: this.state.attachments.slice()});
        },
        acceptFileSelection: function (selection) {
            this.setState({attachments: selection});
        },

        sendAck: function () {
            Peerio.Messages.sendACK(this.state.conversation);
        },
        sendMessage: function () {
            var node = this.refs.reply.getDOMNode();
            if (node.value.isEmpty()) return;
            //Peerio.Messages.sendMessage(this.state.conversation.participants, '', node.value, this.state.attachments, this.state.conversation.id);
            node.value = '';
            this.resizeTextAreaAsync();
            this.setState({attachments: []});
        },
        resizeTextAreaAsync: function () {
            setTimeout(this.resizeTextArea, 0);
        },
        // grows textarea height with content up to max-height css property value
        // or shrinks down to 1 line
        resizeTextArea: function () {
            var node = this.refs.reply.getDOMNode();
            node.style.height = 'auto';
            node.style.height = node.scrollHeight + 'px';
        },
        scrollToBottom: function () {
            if (!this.refs.content)return;
            //bug #153 https://github.com/PeerioTechnologies/peerio-client-mobile/issues/153
            //on android, webview doesn't resize until after focus,
            //so we set a delay and hope the webview is resized by the time we scroll.
            var contentNode = this.refs.content.getDOMNode();
            setTimeout(function () {
                TweenLite.to(contentNode, .5, {scrollTo: {y: contentNode.scrollHeight}});
            }, 500);
        },
        disableIfLastParticipant: function () {
            // If I'm the only one who has left in this conversation
            if (this.state.conversation.participants.length === 1) {
                // But there were other people before
                if (this.state.conversation.exParticipants.length > 0) {
                    // then disable reply
                    this.setState({
                        textEntryDisabled: true,
                        placeholderText: 'There are no participants left in this conversation'
                    });
                } else {
                    // otherwise just inform user that this was never shared with anyone
                    this.setState({placeholderText: 'You are the only person in this conversation.'});
                }
            }
            else {
                // normal case
                this.setState({placeholderText: 'Type your message...'});
            }
        }
        ,
        //----- RENDER
        render: function () {
            // todo: more sophisticated logic for sending receipts, involving scrolling message into view detection
            // todo: also not trying to send receipts that were already sent?
            //Peerio.Data.sendReceipts(this.props.conversationId);
            // todo: loading state
            if (!this.state.conversation) return null;
            var conversation = this.state.conversation;
            var participants = conversation.participants.map(function (username) {
                if (username === Peerio.user.username) return null;
                return (
                    <div key={username}>
                        <Peerio.UI.Avatar username={username}/>
                        {Peerio.user.contacts.getPropValByKey(username, 'fullNameAndUsername')}
                    </div>
                );
            });
            conversation.exParticipants.forEach(function (item) {

                participants.push(
                    <div key={item.u} className='former-participant'>
                        <Peerio.UI.Avatar username={item.u}/>
                        {Peerio.user.contacts.getPropValByKey(item.u, 'fullNameAndUsername')}
                    </div>
                );
            });

            var nodes = this.buildNodes();
            // note: reply has fixed positioning and should not be nested in .content,
            // this causes unwanted scroll when typing into text box
            return (
                <div>
                    <Peerio.UI.ConversationHead subject={conversation.subject} participants={participants}
                                                activeParticipantsCount={conversation.participants.length}
                                                allParticipantsCount={conversation.participants.length+conversation.exParticipants.length}
                                                conversationId={conversation.id}/>

                    <div className="content with-reply-box without-tab-bar" ref="content" key="content">
                        <div className="conversation">
                            {nodes}
                        </div>
                    </div>
                    <div id="reply">
                        <div className="reply-ack">
                            <i className="fa fa-thumbs-o-up icon-btn" onTouchEnd={this.sendAck}></i>
                        </div>

            <textarea className={this.state.textEntryDisabled ?  'reply-input placeholder-warning':'reply-input'}
                      rows="1" ref="reply" placeholder={this.state.placeholderText} onKeyUp={this.resizeTextArea}
                      disabled={this.state.textEntryDisabled} onChange={this.resizeTextArea}
                      onFocus={this.scrollToBottom}></textarea>

                        <div className="reply-attach">
                            <i className="fa fa-paperclip icon-btn"
                               onTouchEnd={this.openFileSelect}>{this.state.attachments.length || ''}</i>
                        </div>
                    </div>
                </div>
            );
        },

        // render helper, returns react nodes for messages
        buildNodes: function () {
            // will be the same for all ack nodes
            var ack = (<i className="fa fa-thumbs-o-up ack-icon"></i>);
            var nodes = [];

            this.state.conversation.messages.forEach(function (item, index) {
                // figuring out render details
                var sender = Peerio.user.contacts.dict[item.sender];
                // mocking contact for deleted contacts todo: ugly!
                if (!sender) {
                    sender = {username: item.sender, fullName: item.sender};
                }

                var isAck = item.body === Peerio.ACK_MSG;
                var isSelf = Peerio.user.username === sender.username;

                //TIMESTAMP
                var prevMessage = index ? this.state.conversation.messages[index - 1] : false;
                var isSameDay = item.moment.isSame(prevMessage.moment, 'day');
                var timestampHTML = ( isSameDay && prevMessage ) ? false :
                    <Peerio.UI.ConversationTimestamp timestamp={item.moment}/>;
                //END TIMESTAMP

                // will be undefined or ready to render root element for receipts
                var receipts;
                // does this node need receipts?
                if (!isSelf) {
                } else {
                    receipts = <Peerio.UI.ConversationReceipt receipts={item.receipts}
                                                              participants={this.state.conversation.participants}/>;
                }
                var body, thisAck;
                // ack message will have and ack icon and no body
                if (isAck) {
                    thisAck = ack;
                } else {
                    var filesCount = item.files.length ?
                        <div className="file-count">{item.files.length} files attached.</div> : null;

                    body = (<div className="body">{filesCount}
                        <Peerio.UI.Linkify text={item.body}
                                           onOpen={Peerio.NativeAPI.openInBrowser}></Peerio.UI.Linkify>
                    </div>);
                }
                var itemClass = React.addons.classSet({
                    'item': true,
                    'self': isSelf,
                    'ack': isAck
                });

                var avatarHTML = (isSelf) ? false : <Peerio.UI.Avatar username={sender.username}/>;
                nodes.push(
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
            }.bind(this));

            return nodes;
        }
    });

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

    Peerio.UI.ConversationTimestamp = React.createClass({
        getInitialState: function () {
            return {relativeTime: true};
        },
        toggleRelative: function () {
            this.setState({relativeTime: !this.state.relativeTime});
        },
        render: function () {
            var timestamp = this.props.timestamp;
            var renderStartTs = moment();
            var momentTimestamp = moment(+timestamp);
            var relativeTime = momentTimestamp.calendar(renderStartTs, {sameElse: 'MMMM DD, YYYY'});
            var absoluteTime = momentTimestamp.format('MMMM DD YYYY, h:mm A');
            var messageDate = (momentTimestamp.isSame(renderStartTs, 'year')) ?
                momentTimestamp.format('MMM Do') : momentTimestamp.format('MMM Do YYYY');

            return <div className="headline-divider"
                        onTouchEnd={this.toggleRelative}>{this.state.relativeTime ? relativeTime : absoluteTime }</div>;
        }
    });

    Peerio.UI.ConversationHead = React.createClass({
        mixins: [ReactRouter.Navigation, ReactRouter.State],
        getInitialState: function () {
            return {open: false};
        },
        toggle: function () {
            this.setState({open: !this.state.open});
        },
        openInfo: function () {
            this.transitionTo('conversation_info', {id: this.props.conversationId});
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
