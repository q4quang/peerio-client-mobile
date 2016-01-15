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
                sending: false
            };
        },
        componentWillMount: function () {
            Peerio.Conversation(this.props.params.id)
                .load()
                .then(c => this.setState({conversation: c}, this.disableIfLastParticipant)) //todo, also call disable on conv update
                .catch(err => {
                    Peerio.Action.showAlert({text: 'Failed to load conversation'});
                    L.error('Failed to load conversation. {0}', err);
                });
        },
        componentDidMount: function () {

            // Peerio.Messages.markAsRead(this.state.conversation);

            this.subscriptions = [
                Peerio.Dispatcher.onBigGreenButton(this.reply),
                Peerio.Dispatcher.onFilesSelected(this.acceptFileSelection),
                Peerio.Dispatcher.onConversationsUpdated(this.handleMessagesUpdated),
                Peerio.Dispatcher.onKeyboardDidShow(() => this.refs.content.scrollToBottom())
            ];

            // to update relative timestamps
            this.renderInterval = window.setInterval(this.forceUpdate.bind(this), 20000);

        },
        componentWillUnmount: function () {
            window.clearInterval(this.renderInterval);
            Peerio.Dispatcher.unsubscribe(this.subscriptions);
        },
        componentDidUpdate: function () {
//            this.scrollToBottom();
        },
        //----- CUSTOM FN
        handleMessagesUpdated: function (data) {
            if (data.updateAllConversations || ( !data.updated && !data.updated.length )
               || (data.updated && data.updated.indexOf(this.props.params.id) != -1) ) {
                this.refs.content.loadNextPage(true);
//                this.refs.content.refresh(()=>this.scrollToBottom());
                return;
            }
            if (data.deleted) {
                if (data.deleted.length && data.deleted.indexOf(this.props.params.id) != -1)
                    this.goBack();
                else 
                    Peerio.Conversation(this.props.params.id)
                    .load().catch( err => {
                        this.goBack();
                    });
            }
        },

        openFileSelect: function () {
            Peerio.Action.showFileSelect({preselected: this.state.attachments.slice()});
        },
        acceptFileSelection: function (selection) {
            this.setState({attachments: selection});
        },

        sendAck: function () {
            this.reply(true);
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
            this.state.conversation.reply(this.state.conversation.participants, body, files)
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
        },

        getPrevPage: function (lastItem, pageSize) {
            var lastSeqID = lastItem ? lastItem.seqID : Number.MAX_SAFE_INTEGER;

            return Peerio.Conversation.getNextMessagesPage(this.props.params.id, lastSeqID, pageSize);
        },

        getPage: function (lastItem, pageSize) {
            var lastSeqID = lastItem ? lastItem.seqID : 0;
            return Peerio.Conversation.getPrevMessagesPage(this.props.params.id, lastSeqID, pageSize);
        },

        getItemsRange: function(from, to){
            // here from and to must be reversed
            return Peerio.Conversation.getMessagesRange(this.props.params.id, to, from);
        },

        //----- RENDER
        render: function () {
            // todo: loading state
            if (!this.state.conversation) return <Peerio.UI.FullViewSpinner/>;
            // todo: more sophisticated logic for sending receipts, involving scrolling message into view detection
            // todo: also not trying to send receipts that were already sent?
            //Peerio.Data.sendReceipts(this.props.conversationId);
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

            // note: reply has fixed positioning and should not be nested in .content,
            // this causes unwanted scroll when typing into text box
            //TODO: textarea onfocus was set to scrollToBottom but was triggerred on every element focus 0_0
            return (
                <div>
                    <Peerio.UI.ConversationHead
                        subject={conversation.subject}
                        participants={participants}
                        activeParticipantsCount={conversation.participants.length}
                        allParticipantsCount={conversation.participants.length+conversation.exParticipants.length}
                        conversationId={conversation.id}/>

                    <Peerio.UI.VScroll
                        onGetPage={this.getPage}
                        onGetPrevPage={this.getPrevPage}
                        onGetItemsRange={this.getItemsRange}
                        itemKeyName='id'
                        itemComponent={Peerio.UI.ConversationItem}
                        itemParentData={conversation}
                        className="content with-reply-box without-tab-bar conversation"
                        ref="content"
                        key="content"
                        reverse="true"
                    />

                    <div id="reply">
                        <div className="reply-ack">
                            <i className="fa fa-thumbs-o-up icon-btn" onTouchEnd={this.sendAck}></i>
                        </div>

                        <textarea
                            className={this.state.textEntryDisabled ?  'reply-input placeholder-warning':'reply-input'}
                            rows="1" ref="reply" placeholder={this.state.placeholderText} onKeyUp={this.resizeTextArea}
                            disabled={this.state.textEntryDisabled} onChange={this.resizeTextArea}></textarea>

                        <div className="reply-attach">
                            <i className="fa fa-paperclip icon-btn"
                               onTouchEnd={this.openFileSelect}>{this.state.attachments.length || ''}</i>
                        </div>
                        {this.state.sending ? (<div id="reply-overlay"></div>) : null}
                    </div>
                </div>
            );
        }
    });
}());
