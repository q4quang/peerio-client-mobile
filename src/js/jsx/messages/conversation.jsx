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
                conversation: null,
                sending: false,
                empty: true
            };
        },
        componentWillMount: function () {
            Peerio.Conversation(this.props.params.id)
                .load()
                .then(c => this.setState({conversation: c}, this.disableIfLastParticipant)) //todo, also call disable on conv update
                .catch(err => {
                    Peerio.Action.showAlert({text: 'Failed to load conversation'});
                    L.error('Failed to load conversation. {0}', err);
                    this.goBack();
                });
        },
        componentDidMount: function () {
            this.subscriptions = [
                Peerio.Dispatcher.onBigGreenButton(this.reply),
                Peerio.Dispatcher.onFilesSelected(this.acceptFileSelection),
                Peerio.Dispatcher.onConversationsUpdated(this.handleConversationsUpdated),
                Peerio.Dispatcher.onKeyboardDidShow(() => {
                    if (!this.keyboardHack) {
                        window.setTimeout(() => this.refs.reply.getDOMNode().blur(), 0);
                        window.setTimeout(() => this.refs.reply.getDOMNode().focus(), 0);
                        this.keyboardHack = true;
                    }
                    window.setTimeout(() => {
                        this.keyboardHack = null;
                    }, 1000);
                    this.refs.content.scrollToBottom();
                })
            ];

            // to update relative timestamps
            this.renderInterval = window.setInterval(this.forceUpdate.bind(this), 20000);
            //this.markAsRead();
        },
        componentWillUnmount: function () {
            window.clearInterval(this.renderInterval);
            Peerio.Dispatcher.unsubscribe(this.subscriptions);
        },
        componentDidUpdate: function () {
            if (this.state.conversation) this.markAsRead();
        },
        //----- CUSTOM FN
        markAsRead: _.throttle(function () {
            var item = this.refs.content && this.refs.content.getLastItem();
            if (!item) return;

            this.state.conversation.markAsRead(item.seqID);
        }, 1000),
        handleConversationsUpdated: function (data) {
            if (data.updated && (data.updated.length === 0 || data.updated.indexOf(this.props.params.id) != -1)) {
                this.state.conversation.loadReadPositions()
                    .then(()=>this.refs.content.loadNextPage(true));
//                this.refs.content.refresh(()=>this.scrollToBottom());
            }
            if (data.deleted) {
                if (data.deleted.length && data.deleted.indexOf(this.props.params.id) != -1)
                    this.goBack();
                else
                    Peerio.Conversation(this.props.params.id)
                        .load().catch(err => {
                        this.goBack();
                    });
            }
        },

        openFileSelect: function () {
            Peerio.NativeAPI.hideKeyboard();
            Peerio.Action.showFileSelect({preselected: this.state.attachments.slice()});
        },
        acceptFileSelection: function (selection) {
            this.setState({attachments: selection});
        },

        sendAck: function () {
            this.reply(true);
        },

        sendReply: function () {
            this.reply(false);
        },
        reply: function (ack) {
            var body, files;
            if (ack) {
                body = Peerio.ACK_MSG;
                files = [];
            } else {
                var node = this.refs.reply.getDOMNode();
                if (node.value.isEmpty()) return;
                body = node.value;
                files = this.state.attachments;
            }
            this.setState({sending: true});
            this.state.conversation.reply(
                this.state.conversation.participants, body, files)
                .then((msg) => {
                    msg.failed && msg.failed.length
                    && Peerio.UI.Alert.show({
                        text: 'Failed to deliver message to following recipients: ' + msg.failed.join(', ')
                    });
                    return msg;
                })
                .catch(err => Peerio.Action.showAlert({text: 'Failed to send message. ' + (err || '')}))
                .finally(()=> {
                    if (ack) {
                        this.setState({sending: false});
                        return;
                    }
                    node.value = '';
                    this.resizeTextAreaAsync();
                    this.setState({attachments: [], sending: false});
                });
            this.setState({empty: true});
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
            if (!this.refs.content) return;
            var contentNode = this.refs.content.getDOMNode();
            setTimeout(function () {
//                contentNode.scrollTop = contentNode.scrollHeight;
                TweenLite.to(contentNode, .3, {scrollTo: {y: contentNode.scrollHeight}});
            }, 200);
        },
        disableIfLastParticipant: function () {
            // If I'm the only one who has left in this conversation
            if (this.state.conversation.participants.length === 0) {
                // But there were other people before
                if (this.state.conversation.exParticipantsArr.length > 0) {
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
        },

        getPrevPage: function (lastItem, pageSize) {
            var lastSeqID = lastItem ? lastItem.seqID : Number.MAX_SAFE_INTEGER;

            return Peerio.Conversation.getNextMessagesPage(this.props.params.id, lastSeqID, pageSize);
        },

        getPage: function (lastItem, pageSize) {
            var lastSeqID = lastItem ? lastItem.seqID : 0;
            return Peerio.Conversation.getPrevMessagesPage(this.props.params.id, lastSeqID, pageSize);
        },

        getItemsRange: function (from, to) {
            // here from and to must be reversed
            return Peerio.Conversation.getMessagesRange(this.props.params.id, to, from);
        },

        setEmpty: function () {
            var node = this.refs.reply.getDOMNode();
            return node.value.isEmpty() ? this.setState({empty: true}) : this.setState({empty: false});
        },

        //----- RENDER
        render: function () {
            // todo: loading state
            if (!this.state.conversation) return <Peerio.UI.FullViewSpinner/>;
            var conversation = this.state.conversation;

            // note: reply has fixed positioning and should not be nested in .content,
            // this causes unwanted scroll when typing into text box
            //TODO: textarea onfocus was set to scrollToBottom but was triggered on every element focus 0_0
            return (
                <div>
                    <Peerio.UI.ConversationHead conversation={conversation}/>
                    <Peerio.UI.VScroll
                        onGetPage={this.getPage}
                        onGetPrevPage={this.getPrevPage}
                        onGetItemsRange={this.getItemsRange}
                        itemKeyName='id'
                        itemComponent={Peerio.UI.Message}
                        itemParentData={conversation}
                        className="content with-reply-box without-tab-bar conversation"
                        ref="content"
                        key="content"
                        reverse="true"
                    />

                    <div id="reply">
                        <div className="reply-attach">
                            <i className="material-icons"
                               onTouchEnd={this.openFileSelect}>
                                attach_file
                            </i>
                            <div
                                className={'icon-counter' + (this.state.attachments.length ? '' : ' hide')}>{this.state.attachments.length || ''}</div>
                        </div>

                      <textarea
                          className={this.state.textEntryDisabled ?  'reply-input placeholder-warning':'reply-input'}
                          rows="1" ref="reply" placeholder={this.state.placeholderText}
                          onKeyUp={this.resizeTextArea, this.setEmpty}
                          disabled={this.state.textEntryDisabled} onChange={this.resizeTextArea}/>

                        { !this.state.empty ?
                            <div className="reply-send">
                                <i className="material-icons" onTouchEnd={this.sendReply}>send</i>
                            </div> :

                            <div className="reply-ack">
                                <i className="material-icons" onTouchEnd={this.sendAck}>thumb_up</i>
                            </div>
                        }


                        {this.state.sending ? (<div id="reply-overlay"></div>) : null}
                    </div>
                </div>
            );
        }
    });
}());
